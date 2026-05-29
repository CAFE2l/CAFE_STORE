import { PaymentStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createServicePayPalOrder } from '@/lib/service-payment';

const paypalCreateSchema = z.object({
  valor: z.coerce.number().positive(),
  descricao: z.string().min(1),
  briefingId: z.string().optional(),
});

export async function POST(request: Request) {
  const parsed = paypalCreateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: 'Dados invalidos para PayPal.' }, { status: 400 });
  }

  const referenceId = parsed.data.briefingId || `service-${Date.now()}`;
  const result = await createServicePayPalOrder({
    amount: parsed.data.valor,
    description: parsed.data.descricao,
    referenceId,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 502 });
  }

  await prisma.payment.create({
    data: {
      provider: 'paypal',
      method: 'paypal',
      status: PaymentStatus.PENDING,
      amount: parsed.data.valor,
      transactionId: result.paypalOrderId,
      rawResponse: { referenceId, approvalUrl: result.approvalUrl },
    },
  }).catch(() => null);

  return Response.json({ orderID: result.paypalOrderId });
}
