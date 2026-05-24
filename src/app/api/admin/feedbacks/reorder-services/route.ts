import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const bodySchema = z.object({ orderedIds: z.array(z.string()).min(1) });

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ success: false, error: 'Dados invalidos.' }, { status: 400 });

  const { orderedIds } = parsed.data;

  // Update each feedback's featured_services_order according to index
  const tx = orderedIds.map((id, idx) =>
    prisma.feedback.update({ where: { id }, data: { isFeaturedServices: true, featuredServicesOrder: idx + 1 } })
  );

  await Promise.allSettled(tx);

  try {
    revalidatePath('/servicos');
    revalidatePath('/api/feedbacks/featured-services');
  } catch (err) {
    console.warn('revalidatePath failed', err);
  }

  return Response.json({ success: true });
}
