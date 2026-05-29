import { PaymentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getMercadoPagoClient, mapMercadoPagoStatus } from '@/lib/service-payment';

type Props = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: Props) {
  const paymentClient = getMercadoPagoClient();

  if (!paymentClient) {
    return Response.json({ error: 'Mercado Pago nao configurado.' }, { status: 503 });
  }

  try {
    const payment = await paymentClient.get({ id: params.id });
    const mapped = mapMercadoPagoStatus(payment.status, payment.date_of_expiration);

    if (mapped.status === 'approved') {
      await prisma.payment.updateMany({
        where: { transactionId: params.id },
        data: { status: PaymentStatus.PAID, paidAt: new Date(), rawResponse: payment as object },
      });
    }

    if (mapped.status === 'rejected' || mapped.status === 'expired') {
      await prisma.payment.updateMany({
        where: { transactionId: params.id },
        data: { status: PaymentStatus.FAILED, rawResponse: payment as object },
      });
    }

    return Response.json(mapped);
  } catch (error) {
    console.error('[PAGAMENTO_STATUS]', error);
    return Response.json({ error: 'Erro ao consultar pagamento.' }, { status: 502 });
  }
}
