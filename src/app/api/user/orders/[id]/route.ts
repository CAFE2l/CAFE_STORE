import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendOrderCancellationNotification } from '@/lib/notifications';
import { OrderStatus } from '@prisma/client';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  // Cancel order by user (only before it is shipped/delivered)
  const session = await auth();
  if (!session?.user?.id) return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });

  const id = params.id;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });
  if (!order || order.userId !== session.user.id) {
    return Response.json({ success: false, error: 'Pedido nao encontrado.' }, { status: 404 });
  }

  // Only allow cancel if not already shipped/delivered/cancelled
  if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
    return Response.json({ success: false, error: 'Nao é possível cancelar este pedido.' }, { status: 400 });
  }

  const updated = await prisma.order.update({ where: { id }, data: { status: OrderStatus.CANCELLED } });

  // Notify support/admin automatically (fire-and-forget, never blocks the response)
  void sendOrderCancellationNotification({
    orderId: order.id,
    customerName: order.user?.name ?? 'Cliente',
    customerEmail: order.user?.email ?? '',
    total: order.total.toNumber(),
    items: order.items
      .map((item) => `${item.product?.name ?? 'Item'} x${item.quantity}`)
      .join(', '),
  });

  return Response.json({ success: true, data: { id: updated.id, status: updated.status } });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Delete order by user (only allowed for cancelled orders — cleans the visual history)
  const session = await auth();
  if (!session?.user?.id) return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });

  const id = params.id;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== session.user.id) {
    return Response.json({ success: false, error: 'Pedido nao encontrado.' }, { status: 404 });
  }

  // Only cancelled orders may be removed from the history
  if (order.status !== OrderStatus.CANCELLED) {
    return Response.json(
      { success: false, error: 'Apenas pedidos cancelados podem ser removidos do historico.' },
      { status: 400 },
    );
  }

  await prisma.order.delete({ where: { id } });
  return Response.json({ success: true });
}
