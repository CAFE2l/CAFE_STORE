import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { adminOrderStatusSchema } from '@/lib/validations';

type OrderRouteProps = { params: { id: string } };

export async function PUT(request: Request, { params }: OrderRouteProps) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  if (!process.env.DATABASE_URL) return Response.json({ success: false, error: 'Banco Neon ainda nao configurado.' }, { status: 503 });

  const parsed = adminOrderStatusSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 });

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });
  return Response.json({ success: true, data: order });
}
