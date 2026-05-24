import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  // Cancel order by user
  const session = await auth();
  if (!session?.user?.id) return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });

  const id = params.id;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== session.user.id) {
    return Response.json({ success: false, error: 'Pedido nao encontrado.' }, { status: 404 });
  }

  // Only allow cancel if not already shipped/delivered/cancelled
  if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
    return Response.json({ success: false, error: 'Nao é possível cancelar este pedido.' }, { status: 400 });
  }

  const updated = await prisma.order.update({ where: { id }, data: { status: OrderStatus.CANCELLED } });
  return Response.json({ success: true, data: { id: updated.id, status: updated.status } });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  // Delete order by user (only allowed if canceled or pending?)
  const session = await auth();
  if (!session?.user?.id) return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });

  const id = params.id;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.userId !== session.user.id) {
    return Response.json({ success: false, error: 'Pedido nao encontrado.' }, { status: 404 });
  }

  // Allow deletion only if status is CANCELLED or PENDING (not shipped/delivered)
  if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
    return Response.json({ success: false, error: 'Nao é possível excluir este pedido.' }, { status: 400 });
  }

  await prisma.order.delete({ where: { id } });
  return Response.json({ success: true });
}
