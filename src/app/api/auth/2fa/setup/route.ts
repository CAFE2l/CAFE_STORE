import * as otplib from 'otplib';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true },
  });

  if (user?.twoFactorEnabled) {
    return Response.json({ success: false, error: '2FA ja esta ativado.' }, { status: 400 });
  }

  const secret = otplib.generateSecret();
  const serviceName = 'Cafe Store';
  const otpauthUrl = otplib.generateURI({
    strategy: 'totp',
    issuer: serviceName,
    label: session.user.email ?? session.user.id,
    secret,
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: secret },
  });

  return Response.json({ success: true, data: { secret, otpauth_url: otpauthUrl } });
}
