import { BriefingStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const status = body?.status;

  if (!Object.values(BriefingStatus).includes(status)) {
    return NextResponse.json({ success: false, error: 'Status invalido.' }, { status: 400 });
  }

  const briefing = await prisma.projectBriefing.update({
    where: { id: params.id },
    data: { status },
  });

  revalidatePath('/admin/briefings');

  return NextResponse.json({ success: true, data: briefing });
}
