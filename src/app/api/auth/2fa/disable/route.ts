import { compare } from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const body = (await request.json()) as { password?: string; token?: string };
  if (!body.password && !body.token) {
    return Response.json({ success: false, error: 'Senha ou codigo 2FA necessario.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, twoFactorEnabled: true, twoFactorSecret: true },
  });

  if (!user?.twoFactorEnabled) {
    return Response.json({ success: false, error: '2FA nao esta ativado.' }, { status: 400 });
  }

  if (body.password && user.password) {
    const valid = await compare(body.password, user.password);
    if (!valid) {
      return Response.json({ success: false, error: 'Senha atual incorreta.' }, { status: 400 });
    }
  }

  const data: Prisma.UserUpdateInput = {
    twoFactorSecret: null,
    twoFactorEnabled: false,
    twoFactorActivatedAt: null,
    twoFactorRecoveryCodes: null,
  };

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  return Response.json({ success: true });
}
