import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (params.id === session.user.id) {
    return NextResponse.json({ error: 'Você não pode excluir sua própria conta pelo painel.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath('/admin/usuarios');

  return NextResponse.json({ success: true });
}
