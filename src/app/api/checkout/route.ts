import { OrderStatus, ProductStatus } from '@prisma/client';
import { auth } from '@/lib/auth';
import { generatePixPayload, getPixQrCodeUrl } from '@/lib/pix';
import { prisma } from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validations';

const shipping = 18.9;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json(
      {
        success: false,
        error: 'Faca login para finalizar a compra.',
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

  for (const item of input.items) {
    const product = productById.get(item.productId);

    if (!product || product.stock < item.quantity) {
      return Response.json(
        {
          success: false,
          error: product
            ? `Estoque insuficiente para ${product.name}.`
            : 'Produto nao encontrado.',
        },
        { status: 400 },
      );
    }
  }

  const subtotal = input.items.reduce((sum, item) => {
    const product = productById.get(item.productId);

    return sum + (product?.price.toNumber() ?? 0) * item.quantity;
  }, 0);
  const total = subtotal + shipping;

  const order = await prisma.$transaction(async (transaction) => {
    const createdOrder = await transaction.order.create({
      data: {
        userId: session.user.id,
        status: OrderStatus.PENDING,
        total,
        paymentMethod: input.paymentMethod,
        phone: input.customer.phone,
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

    await Promise.all(
      input.items.map((item) =>
        transaction.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        }),
      ),
    );

    return createdOrder;
  });

  const pixPayload =
    input.paymentMethod === 'pix'
      ? generatePixPayload({
          key: process.env.PIX_KEY ?? '',
          merchantName: process.env.PIX_MERCHANT_NAME ?? 'CAFE STORE',
          merchantCity: process.env.PIX_MERCHANT_CITY ?? 'CURITIBA',
          amount: total,
          txid: order.id,
          description: `Pedido ${order.id}`,
        })
      : null;

  return Response.json({
    success: true,
    data: {
      orderId: order.id,
      paymentMethod: input.paymentMethod,
      pix: pixPayload
        ? {
            payload: pixPayload,
            qrCodeUrl: getPixQrCodeUrl(pixPayload),
          }
        : undefined,
    },
  });
}
