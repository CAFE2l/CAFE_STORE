import { OrderStatus } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusMap: Record<OrderStatus, string> = {
  PENDING: 'aguardando_pagamento',
  SCHEDULED: 'agendado',
  PROCESSING: 'em_processamento',
  SHIPPED: 'enviado',
  DELIVERED: 'entregue',
  CANCELLED: 'cancelado',
};

const reverseStatusMap: Record<string, OrderStatus> = {
  aguardando_pagamento: 'PENDING',
  agendado: 'SCHEDULED',
  em_processamento: 'PROCESSING',
  enviado: 'SHIPPED',
  entregue: 'DELIVERED',
  cancelado: 'CANCELLED',
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const status = searchParams.get('status');
  const q = searchParams.get('q')?.trim();
  const take = 6;

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id,
      ...(status && status !== 'todos' && reverseStatusMap[status] ? { status: reverseStatusMap[status] } : {}),
      ...(q ? { id: { contains: q } } : {}),
    },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });

  const nextCursor = orders.length > take ? orders[take].id : null;
  const pageOrders = orders.slice(0, take);
  const total = await prisma.order.count({ where: { userId: session.user.id } });

  return Response.json({
    success: true,
    data: {
      total,
      nextCursor,
      orders: pageOrders.map((order) => ({
        id: order.id,
        numero: order.id.slice(-8).toUpperCase(),
        created_at: order.createdAt.toISOString(),
        status: statusMap[order.status],
        total: order.total.toNumber(),
        metodo_pagamento: order.paymentMethod,
        endereco_entrega: order.address,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          slug: item.product.slug,
          nome: item.product.name,
          thumbnail: item.product.images[0] ?? '/placeholder-product.svg',
          quantidade: item.quantity,
          preco: item.price.toNumber(),
          variants: item.variants ?? [],
        })),
      })),
    },
  });
}
