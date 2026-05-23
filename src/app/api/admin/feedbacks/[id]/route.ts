import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import { serializeFeedback } from '@/lib/feedbacks';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  isApproved: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ success: false, error: 'Dados inválidos.' }, { status: 400 });

  const feedback = await prisma.feedback.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.isApproved !== undefined && { isApproved: parsed.data.isApproved }),
      ...(parsed.data.isVerified !== undefined && { isVerified: parsed.data.isVerified }),
      ...(parsed.data.isFeatured !== undefined && { isFeatured: parsed.data.isFeatured }),
    },
  });

  return Response.json({ success: true, data: serializeFeedback(feedback) });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  await prisma.feedback.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}
