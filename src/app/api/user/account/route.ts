import { compare } from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const body = (await request.json()) as { password?: string };
  if (!body.password) {
    return Response.json({ success: false, error: 'Informe sua senha atual.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return Response.json({ success: false, error: 'Conta sem senha local. Entre em contato com o suporte.' }, { status: 400 });
  }

  const valid = await compare(body.password, user.password);
  if (!valid) {
    return Response.json({ success: false, error: 'Senha incorreta.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { deletedAt: new Date() },
  });

  return Response.json({ success: true });
}
