import { PaymentStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { captureServicePayPalOrder } from '@/lib/service-payment';

const paypalCaptureSchema = z.object({
  orderID: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = paypalCaptureSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json({ error: 'OrderID invalido.' }, { status: 400 });
  }

  const result = await captureServicePayPalOrder(parsed.data.orderID);

  if (!result.ok) {
    await prisma.payment.updateMany({
      where: { transactionId: parsed.data.orderID },
      data: { status: PaymentStatus.FAILED, rawResponse: { error: result.error } },
    });
    return Response.json({ error: result.error }, { status: 502 });
  }

  await prisma.payment.updateMany({
    where: { transactionId: parsed.data.orderID },
    data: {
      status: PaymentStatus.PAID,
      paidAt: new Date(),
      rawResponse: result,
    },
  });

  return Response.json({ status: 'approved', paymentId: result.paymentId });
}
