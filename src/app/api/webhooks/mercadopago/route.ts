import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const MP_API = 'https://api.mercadopago.com';

async function verifyPayment(paymentId: string): Promise<{ status: string; externalReference?: string } | null> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      status: data.status as string,
      externalReference: data.external_reference as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: string;
    data?: { id?: string };
    type?: string;
    external_reference?: string;
  };

  const paymentId = body.data?.id;

  if (!paymentId) {
    return Response.json({ success: true, data: { received: true } });
  }

  const payment = await verifyPayment(paymentId);

  if (!payment) {
    return Response.json({ success: true, data: { received: true } });
  }

  const orderId = payment.externalReference ?? body.external_reference;

  if (!orderId || !process.env.DATABASE_URL) {
    return Response.json({ success: true, data: { received: true } });
  }

  const newStatus =
    payment.status === 'approved'
      ? OrderStatus.PROCESSING
      : payment.status === 'pending'
        ? OrderStatus.PENDING
        : OrderStatus.CANCELLED;

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus,
      paymentId,
    },
  });

  return Response.json({ success: true, data: { received: true } });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('external_reference');

  if (paymentId) {
    const payment = await verifyPayment(paymentId);
    if (payment) {
      const newStatus =
        payment.status === 'approved'
          ? OrderStatus.PROCESSING
          : payment.status === 'pending'
            ? OrderStatus.PENDING
            : OrderStatus.CANCELLED;

      if (orderId && process.env.DATABASE_URL) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: newStatus,
            paymentId,
          },
        });
      }
    }
  }

  return Response.redirect(`${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/checkout/confirmation?orderId=${orderId ?? ''}&method=mercadopago`);
}
