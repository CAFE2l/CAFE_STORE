import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (params.id === session.user.id) {
    return NextResponse.json({ error: 'Você não pode alterar seu próprio role.' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const role = body?.role;

  if (!Object.values(Role).includes(role)) {
    return NextResponse.json({ error: 'Role inválido.' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
  });

  revalidatePath('/admin/usuarios');

  return NextResponse.json({ success: true, role: user.role });
}
