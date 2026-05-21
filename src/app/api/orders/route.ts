import { auth } from '@/lib/auth';
import { getUserOrders } from '@/lib/account';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      {
        success: false,
        error: 'Nao autenticado.',
      },
      { status: 401 },
    );
  }

  const orders = await getUserOrders(session.user.id);

  return Response.json({
    success: true,
    data: orders,
  });
}
