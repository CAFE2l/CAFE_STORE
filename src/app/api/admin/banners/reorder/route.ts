import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  const body = (await req.json()) as { orderedIds?: string[] };
  if (!Array.isArray(body.orderedIds)) {
    return NextResponse.json({ success: false, error: 'Ordem invalida.' }, { status: 400 });
  }

  await prisma.$transaction(
    body.orderedIds.map((id, index) =>
      prisma.banner.update({
        where: { id },
        data: { position: index },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
