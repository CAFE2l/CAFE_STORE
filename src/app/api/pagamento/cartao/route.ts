import { PaymentStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getBaseUrl, getMercadoPagoClient, mapMercadoPagoStatus } from '@/lib/service-payment';

const cardSchema = z.object({
  valor: z.coerce.number().positive(),
  descricao: z.string().min(1),
  email: z.string().email(),
  briefingId: z.string().optional(),
  formData: z.record(z.string(), z.unknown()),
});

export async function POST(request: Request) {
  const parsed = cardSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: 'Dados invalidos para pagamento com cartao.' }, { status: 400 });
  }

  const paymentClient = getMercadoPagoClient();

  if (!paymentClient) {
    return Response.json({ error: 'Mercado Pago nao configurado.' }, { status: 503 });
  }

  const { valor, descricao, email, briefingId, formData } = parsed.data;
  const token = typeof formData.token === 'string' ? formData.token : undefined;
  const paymentMethodId = typeof formData.payment_method_id === 'string' ? formData.payment_method_id : undefined;
  const issuerId = Number(formData.issuer_id);
  const installments = Number(formData.installments || 1);

  if (!token || !paymentMethodId) {
    return Response.json({ error: 'Token do cartao nao foi gerado.' }, { status: 400 });
  }

  try {
    const payment = await paymentClient.create({
      body: {
        transaction_amount: valor,
        token,
        description: descricao,
        installments,
        payment_method_id: paymentMethodId,
        issuer_id: Number.isFinite(issuerId) ? issuerId : undefined,
        external_reference: briefingId,
        notification_url: `${getBaseUrl()}/api/pagamento/webhook`,
        payer: {
          email,
        },
      },
      requestOptions: {
        idempotencyKey: `card-${briefingId || email}-${Date.now()}`,
      },
    });

    const mapped = mapMercadoPagoStatus(payment.status, payment.date_of_expiration);

    await prisma.payment.create({
      data: {
        provider: 'mercadopago',
        method: 'card',
        status: mapped.status === 'approved' ? PaymentStatus.PAID : mapped.status === 'rejected' ? PaymentStatus.FAILED : PaymentStatus.PENDING,
        amount: valor,
        transactionId: String(payment.id),
        paidAt: mapped.status === 'approved' ? new Date() : undefined,
        rawResponse: payment as object,
      },
    }).catch(() => null);

    return Response.json({
      id: String(payment.id),
      status: mapped.status,
      providerStatus: payment.status,
    });
  } catch (error) {
    console.error('[PAGAMENTO_CARTAO]', error);
    return Response.json({ error: 'Pagamento recusado ou indisponivel.' }, { status: 502 });
  }
}
