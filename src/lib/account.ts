import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type AccountOrderListItem = {
  id: string;
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  createdAt: Date;
  itemCount: number;
};

export type AccountOrderDetail = AccountOrderListItem & {
  phone: string;
  address: unknown;
  items: {
    id: string;
    quantity: number;
    price: number;
    variants: unknown;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
    };
  }[];
};

export async function getProfile(userId: string) {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      phone: true,
      createdAt: true,
      addresses: {
        orderBy: {
          isDefault: 'desc',
        },
      },
      wishlist: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
              price: true,
            },
          },
        },
      },
    },
  });
}

export async function getUserOrders(userId: string): Promise<AccountOrderListItem[]> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const orders = await prisma.order.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      status: true,
      total: true,
      paymentMethod: true,
      createdAt: true,
      items: {
        select: {
          quantity: true,
        },
      },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    total: order.total.toNumber(),
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }));
}

export async function getUserOrderById(userId: string, orderId: string): Promise<AccountOrderDetail | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    select: {
      id: true,
      status: true,
      total: true,
      paymentMethod: true,
      phone: true,
      address: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          variants: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  return {
    id: order.id,
    status: order.status,
    total: order.total.toNumber(),
    paymentMethod: order.paymentMethod,
    phone: order.phone,
    address: order.address,
    createdAt: order.createdAt,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    items: order.items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
    })),
  };
}
