import { NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const body = (await request.json()) as { currentPassword: string; newPassword: string };

  if (!body.currentPassword || !body.newPassword) {
    return NextResponse.json({ success: false, error: 'Preencha todos os campos.' }, { status: 400 });
  }

  if (body.newPassword.length < 6) {
    return NextResponse.json({ success: false, error: 'A nova senha deve ter no minimo 6 caracteres.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return NextResponse.json({ success: false, error: 'Conta sem senha local. Use login social.' }, { status: 400 });
  }

  const isValid = await compare(body.currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json({ success: false, error: 'Senha atual incorreta.' }, { status: 400 });
  }

  const hashedPassword = await hash(body.newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ success: true });
}
