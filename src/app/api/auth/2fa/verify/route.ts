import * as otplib from 'otplib';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const loginAttempts = new Map<string, { count: number; blockedUntil?: number }>();
const maxAttempts = 5;
const blockMs = 15 * 60 * 1000;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const key = `2fa:${session.user.id}`;
  const attempt = loginAttempts.get(key);
  if (attempt?.blockedUntil && attempt.blockedUntil > Date.now()) {
    return Response.json({ success: false, error: 'Muitas tentativas. Tente novamente em 15 minutos.' }, { status: 429 });
  }

  const body = (await request.json()) as { token?: string };
  if (!body.token || body.token.length !== 6) {
    return Response.json({ success: false, error: 'Codigo invalido.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (user?.twoFactorEnabled) {
    return Response.json({ success: false, error: '2FA ja esta ativado.' }, { status: 400 });
  }

  if (!user?.twoFactorSecret) {
    return Response.json({ success: false, error: 'Nenhum segredo 2FA encontrado. Faca o setup novamente.' }, { status: 400 });
  }

  const isValid = otplib.verify({ token: body.token, secret: user.twoFactorSecret });
  if (!isValid) {
    const current = loginAttempts.get(key) ?? { count: 0 };
    const count = current.count + 1;
    loginAttempts.set(key, {
      count,
      blockedUntil: count >= maxAttempts ? Date.now() + blockMs : undefined,
    });
    return Response.json({ success: false, error: 'Codigo invalido.' }, { status: 400 });
  }

  loginAttempts.delete(key);

  const recoveryCodes: string[] = Array.from({ length: 8 }, () => {
    const buf = randomBytes(5);
    const code = buf.toString('hex').toUpperCase().slice(0, 5);
    return `${code.slice(0, 5)}-${code.slice(5, 10).padEnd(5, 'X')}`;
  });

  const hashedCodes = await Promise.all(
    recoveryCodes.map((code) => hash(code, 6)),
  );

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorActivatedAt: new Date(),
      twoFactorRecoveryCodes: hashedCodes,
    },
  });

  return Response.json({ success: true, data: { recoveryCodes } });
}
