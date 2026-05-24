import { compare, hash } from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function isStrongEnough(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const body = (await request.json()) as { currentPassword?: string; newPassword?: string };
  if (!body.currentPassword || !body.newPassword) {
    return Response.json({ success: false, error: 'Preencha todos os campos.' }, { status: 400 });
  }

  if (!isStrongEnough(body.newPassword)) {
    return Response.json({ success: false, error: 'A nova senha deve ter 8 caracteres, maiuscula, numero e especial.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { password: true } });
  if (!user?.password) {
    return Response.json({ success: false, error: 'Conta sem senha local. Use login social.' }, { status: 400 });
  }

  const valid = await compare(body.currentPassword, user.password);
  if (!valid) {
    return Response.json({ success: false, field: 'currentPassword', error: 'Senha atual incorreta.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: await hash(body.newPassword, 12) },
  });

  return Response.json({ success: true });
}
