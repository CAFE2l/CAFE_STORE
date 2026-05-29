import { PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getMercadoPagoClient, mapMercadoPagoStatus } from '@/lib/service-payment';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const paymentId =
    body?.data?.id ||
    body?.id ||
    new URL(request.url).searchParams.get('data.id') ||
    new URL(request.url).searchParams.get('id');

  if (!paymentId) {
    return Response.json({ ok: true });
  }

  const paymentClient = getMercadoPagoClient();
  if (!paymentClient) {
    return Response.json({ ok: true });
  }

  try {
    const payment = await paymentClient.get({ id: paymentId });
    const mapped = mapMercadoPagoStatus(payment.status, payment.date_of_expiration);

    await prisma.payment.updateMany({
      where: { transactionId: String(paymentId) },
      data: {
        status: mapped.status === 'approved' ? PaymentStatus.PAID : mapped.status === 'pending' ? PaymentStatus.PENDING : PaymentStatus.FAILED,
        paidAt: mapped.status === 'approved' ? new Date() : undefined,
        rawResponse: payment as object,
      },
    });
  } catch (error) {
    console.error('[PAGAMENTO_WEBHOOK]', error);
  }

  return Response.json({ ok: true });
}
