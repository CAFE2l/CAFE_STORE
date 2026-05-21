import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type MercadoPagoWebhookBody = {
  data?: {
    id?: string;
  };
  external_reference?: string;
  orderId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as MercadoPagoWebhookBody;
  const orderId = body.external_reference ?? body.orderId;

  if (!orderId || !process.env.DATABASE_URL) {
    return Response.json({
      success: true,
      data: {
        received: true,
      },
    });
  }

  await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: OrderStatus.PROCESSING,
      paymentId: body.data?.id,
    },
  });

  return Response.json({
    success: true,
    data: {
      received: true,
    },
  });
}
