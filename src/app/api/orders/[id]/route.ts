import { auth } from '@/lib/auth';
import { getUserOrderById } from '@/lib/account';

type OrderRouteProps = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: OrderRouteProps) {
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

  const order = await getUserOrderById(session.user.id, params.id);

  if (!order) {
    return Response.json(
      {
        success: false,
        error: 'Pedido nao encontrado.',
      },
      { status: 404 },
    );
  }

  return Response.json({
    success: true,
    data: order,
  });
}
