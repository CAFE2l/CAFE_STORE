import { OrderStatus } from '@prisma/client';
import { capturePayPalOrder } from '@/lib/paypal';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const orderId = searchParams.get('orderId');

  if (!token || !orderId || !process.env.DATABASE_URL) {
    return Response.redirect(
      `${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/checkout/confirmation?status=failure`,
    );
  }

  const capture = await capturePayPalOrder(token);

  return Response.redirect(
    `${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/checkout/confirmation?orderId=${orderId}&method=paypal&status=${capture.ok ? 'approved' : 'failure'}`,
  );
}

export async function POST(request: Request) {
  const body = await request.json();

  const eventType = body.event_type as string | undefined;

  if (eventType === 'CHECKOUT.ORDER.APPROVED' || eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    const orderId = body.resource?.purchase_units?.[0]?.reference_id ?? body.resource?.custom_id;

    if (orderId && process.env.DATABASE_URL) {
      const paymentId = body.resource?.id ?? body.resource?.purchase_units?.[0]?.payments?.captures?.[0]?.id;

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PROCESSING,
          paymentId: paymentId ?? null,
        },
      });
    }
  }

  return Response.json({ success: true });
}
