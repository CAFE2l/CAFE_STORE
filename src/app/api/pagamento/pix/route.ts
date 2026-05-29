import { PaymentStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getBaseUrl, getMercadoPagoClient } from '@/lib/service-payment';

const pixSchema = z.object({
  valor: z.coerce.number().positive(),
  descricao: z.string().min(1),
  email: z.string().email(),
  briefingId: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = pixSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: 'Dados invalidos para gerar Pix.' }, { status: 400 });
  }

  const paymentClient = getMercadoPagoClient();

  if (!paymentClient) {
    return Response.json({ error: 'Mercado Pago nao configurado.' }, { status: 503 });
  }

  const input = parsed.data;
  const expiracao = new Date(Date.now() + 30 * 60 * 1000);

  try {
    const payment = await paymentClient.create({
      body: {
        transaction_amount: input.valor,
        description: input.descricao,
        payment_method_id: 'pix',
        date_of_expiration: expiracao.toISOString(),
        external_reference: input.briefingId,
        notification_url: `${getBaseUrl()}/api/pagamento/webhook`,
        payer: {
          email: input.email,
        },
      },
      requestOptions: {
        idempotencyKey: `pix-${input.briefingId || input.email}-${Date.now()}`,
      },
    });

    const transactionData = payment.point_of_interaction?.transaction_data;
    const paymentId = String(payment.id);

    await prisma.payment.create({
      data: {
        provider: 'mercadopago',
        method: 'pix',
        status: PaymentStatus.PENDING,
        amount: input.valor,
        transactionId: paymentId,
        rawResponse: payment as object,
      },
    }).catch(() => null);

    return Response.json({
      qr_code: transactionData?.qr_code,
      qr_code_base64: transactionData?.qr_code_base64,
      id: paymentId,
      expiracao,
    });
  } catch (error) {
    console.error('[PAGAMENTO_PIX]', error);
    return Response.json({ error: 'Erro ao gerar Pix.' }, { status: 502 });
  }
}
