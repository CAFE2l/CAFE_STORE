import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import { serializeFeedback } from '@/lib/feedbacks';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const updateSchema = z.object({
  isApproved: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
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
      ...(parsed.data.status !== undefined && { status: parsed.data.status, isApproved: parsed.data.status === 'APPROVED' }),
      ...(parsed.data.priority !== undefined && { priority: parsed.data.priority }),
    },
  });

  // revalidate pages that depend on feedbacks
  try {
    revalidatePath('/servicos');
    revalidatePath('/api/feedbacks/featured-services');
  } catch (err) {
    // ignore if not running in Next environment
    console.warn('revalidatePath failed', err);
  }

  return Response.json({ success: true, data: serializeFeedback(feedback) });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const isFeaturedServices = body.isFeaturedServices ?? body.is_featured_services;

  if (typeof isFeaturedServices !== 'boolean') {
    return Response.json({ success: false, error: 'Dados inválidos.' }, { status: 400 });
  }

  if (isFeaturedServices) {
    // compute next order
    const count = await prisma.feedback.count({ where: { isFeaturedServices: true } });
    const updated = await prisma.feedback.update({
      where: { id: params.id },
      data: { isFeaturedServices: true, featuredServicesOrder: count + 1 },
    });

    try {
      revalidatePath('/servicos');
      revalidatePath('/api/feedbacks/featured-services');
    } catch (err) {
      console.warn('revalidatePath failed', err);
    }

    return Response.json({ success: true, data: serializeFeedback(updated) });
  }

  // disabling: remove and reorder
  const current = await prisma.feedback.findUnique({ where: { id: params.id }, select: { featuredServicesOrder: true } });
  await prisma.feedback.update({ where: { id: params.id }, data: { isFeaturedServices: false, featuredServicesOrder: 0 } });

  if (current?.featuredServicesOrder) {
    await prisma.$executeRaw`
      UPDATE feedbacks
      SET featured_services_order = featured_services_order - 1
      WHERE is_featured_services = true
        AND featured_services_order > ${current.featuredServicesOrder}
    `;
  }

  try {
    revalidatePath('/servicos');
    revalidatePath('/api/feedbacks/featured-services');
  } catch (err) {
    console.warn('revalidatePath failed', err);
  }

  return Response.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  await prisma.feedback.delete({ where: { id: params.id } });

  try {
    revalidatePath('/servicos');
    revalidatePath('/api/feedbacks/featured-services');
  } catch (err) {
    console.warn('revalidatePath failed', err);
  }

  return Response.json({ success: true });
}
