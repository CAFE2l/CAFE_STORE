import { OrderStatus, ProductStatus } from '@prisma/client';
import { auth } from '@/lib/auth';
import { createCheckoutPreference } from '@/lib/mercadopago';
import { createPayPalOrder } from '@/lib/paypal';
import { generatePixPayload, getPixQrCodeUrl } from '@/lib/pix';
import { sendPixNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validations';

const shipping = 0;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      {
        success: false,
        error: 'Faca login para finalizar o apoio.',
      },
      { status: 401 },
    );
  }

  const body: unknown = await request.json();
  const parsedBody = checkoutSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      {
        success: false,
        error: parsedBody.error.issues[0]?.message ?? 'Dados invalidos.',
      },
      { status: 400 },
    );
  }

  if (!process.env.DATABASE_URL) {
    return Response.json(
      {
        success: false,
        error: 'Banco Neon ainda nao configurado.',
      },
      { status: 503 },
    );
  }

  const input = parsedBody.data;
  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      status: ProductStatus.ACTIVE,
    },
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
    },
  });

  if (products.length !== productIds.length) {
    return Response.json(
      {
        success: false,
        error: 'Um ou mais produtos nao estao disponiveis.',
      },
      { status: 400 },
    );
  }

  const productById = new Map(products.map((product) => [product.id, product]));

  const subtotal = input.items.reduce((sum, item) => {
    const product = productById.get(item.productId);

    return sum + (product?.price.toNumber() ?? 0) * item.quantity;
  }, 0);
  let total = subtotal + shipping;

  let appliedCoupon: { id: string; code: string; discount: number; type: string; discountValue?: number } | null = null;

  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: input.couponCode.toUpperCase() },
    });

    if (!coupon || !coupon.active || (coupon.expiresAt && coupon.expiresAt < new Date()) || (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)) {
      return Response.json({ success: false, error: 'Cupom invalido ou expirado.' }, { status: 400 });
    }

    if (coupon.minAmount && subtotal < coupon.minAmount.toNumber()) {
      return Response.json({ success: false, error: `Valor minimo de R$ ${coupon.minAmount.toNumber()} para este cupom.` }, { status: 400 });
    }

    appliedCoupon = {
      id: coupon.id,
      code: coupon.code,
      discount: coupon.discount.toNumber(),
      type: coupon.type,
    };

    const totalBeforeDiscount = subtotal + shipping;

    if (appliedCoupon.type === 'PERCENTAGE') {
      total = subtotal * (1 - appliedCoupon.discount / 100) + shipping;
    } else {
      total = Math.max(0, subtotal - appliedCoupon.discount) + shipping;
    }

    appliedCoupon.discountValue = totalBeforeDiscount - total;
  }

  let order: { id: string } | null = null;

  try {
    order = await prisma.$transaction(async (transaction) => {
    const createdOrder = await transaction.order.create({
      data: {
        userId: session.user.id,
        status: OrderStatus.PENDING,
        total,
        paymentMethod: input.paymentMethod,
        phone: input.customer.phone,
        couponCode: appliedCoupon?.code,
        couponDiscount: appliedCoupon ? appliedCoupon.discountValue : undefined,
        address: input.address,
        items: {
          create: input.items.map((item) => {
            const product = productById.get(item.productId);

            if (!product) {
              throw new Error('Produto invalido.');
            }

            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
              variants: item.variants ?? [],
            };
          }),
        },
      },
      select: {
        id: true,
      },
    });

    for (const item of input.items) {
      const result = await transaction.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });

      if (result.count === 0) {
        throw new Error(`Estoque insuficiente para um dos produtos.`);
      }
    }

    if (input.couponCode) {
      await transaction.coupon.update({
        where: { code: input.couponCode.toUpperCase() },
        data: { usedCount: { increment: 1 } },
      });
    }

    return createdOrder;
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao processar pedido.';
    return Response.json({ success: false, error: message }, { status: 409 });
  }

  if (!order) {
    return Response.json({ success: false, error: 'Erro ao criar pedido.' }, { status: 500 });
  }

  const pixKey = process.env.PIX_KEY ?? '';

  const pixPayload =
    input.paymentMethod === 'pix'
      ? generatePixPayload({
          key: pixKey,
          merchantName: process.env.PIX_MERCHANT_NAME ?? 'CAFE STORE',
          merchantCity: process.env.PIX_MERCHANT_CITY ?? 'CURITIBA',
          amount: total,
          txid: order.id,
          description: `Apoio ${order.id}`,
        })
      : null;

  if (input.paymentMethod === 'pix') {
    const itemsList = input.items
      .map((item) => {
        const p = productById.get(item.productId);
        return p ? `${p.name} x${item.quantity}` : '';
      })
      .join(', ');
    sendPixNotification({
      orderId: order.id,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      total,
      items: itemsList,
    });
  }

  let mpInitPoint: string | null = null;

  if (input.paymentMethod === 'mercadopago') {
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';
    const result = await createCheckoutPreference({
      items: input.items.map((item) => {
        const product = productById.get(item.productId)!;
        return {
          title: product.name,
          quantity: item.quantity,
          unitPrice: product.price.toNumber(),
        };
      }),
      payerEmail: input.customer.email,
      payerName: input.customer.name,
      externalReference: order.id,
      notificationUrl: `${baseUrl}/api/webhooks/mercadopago`,
      backUrls: {
        success: `${baseUrl}/checkout/confirmation?orderId=${order.id}&method=mercadopago`,
        failure: `${baseUrl}/checkout?status=failure`,
        pending: `${baseUrl}/checkout/confirmation?orderId=${order.id}&method=mercadopago`,
      },
    });

    if (!result.ok) {
      return Response.json({ success: false, error: result.error }, { status: 502 });
    }

    mpInitPoint = result.initPoint;
  }

  let paypalApprovalUrl: string | null = null;

  if (input.paymentMethod === 'paypal') {
    const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';
    const result = await createPayPalOrder({
      items: input.items.map((item) => {
        const product = productById.get(item.productId)!;
        return {
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.price.toNumber(),
        };
      }),
      total,
      orderId: order.id,
      returnUrl: `${baseUrl}/api/webhooks/paypal/capture?orderId=${order.id}`,
      cancelUrl: `${baseUrl}/checkout?status=failure`,
    });

    if (!result.ok) {
      return Response.json({ success: false, error: result.error }, { status: 502 });
    }

    paypalApprovalUrl = result.approvalUrl;
  }

  return Response.json({
    success: true,
    data: {
      orderId: order.id,
      paymentMethod: input.paymentMethod,
      pix: pixPayload
        ? {
            payload: pixPayload,
            qrCodeUrl: getPixQrCodeUrl(pixPayload),
            key: pixKey,
            keyQrCodeUrl: getPixQrCodeUrl(pixKey),
          }
        : undefined,
      mpInitPoint: mpInitPoint ?? undefined,
      paypalApprovalUrl: paypalApprovalUrl ?? undefined,
    },
  });
}
