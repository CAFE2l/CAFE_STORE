import { getAdminOrders, requireAdmin } from '@/lib/admin';

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  return Response.json({ success: true, data: await getAdminOrders() });
}
