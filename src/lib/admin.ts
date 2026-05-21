import { OrderStatus, ProductStatus, Role } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return null;
  }

  return session;
}

export async function getAdminDashboard() {
  if (!process.env.DATABASE_URL) {
    return {
      metrics: { orders: 0, revenue: 0, customers: 0, products: 0 },
      ordersByDay: [],
      recentOrders: [],
    };
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [orders, paidOrders, customers, products, recentOrders, ordersByDayRaw] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      where: { status: { not: OrderStatus.CANCELLED } },
      select: { total: true },
    }),
    prisma.user.count({ where: { role: Role.CUSTOMER } }),
    prisma.product.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  const dayMap = new Map<string, number>();
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + offset);
    dayMap.set(date.toISOString().slice(0, 10), 0);
  }

  for (const order of ordersByDayRaw) {
    const key = order.createdAt.toISOString().slice(0, 10);
    dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
  }

  return {
    metrics: {
      orders,
      revenue: paidOrders.reduce((sum, order) => sum + order.total.toNumber(), 0),
      customers,
      products,
    },
    ordersByDay: Array.from(dayMap.entries()).map(([date, total]) => ({ date, total })),
    recentOrders: recentOrders.map((order) => ({ ...order, total: order.total.toNumber() })),
  };
}

export async function getAdminProducts() {
  if (!process.env.DATABASE_URL) return [];

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });

  return products.map((product) => ({
    ...product,
    price: product.price.toNumber(),
    oldPrice: product.oldPrice?.toNumber() ?? null,
  }));
}

export async function getAdminProduct(id: string) {
  if (!process.env.DATABASE_URL) return null;

  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product) return null;

  return {
    ...product,
    price: product.price.toNumber(),
    oldPrice: product.oldPrice?.toNumber() ?? null,
  };
}

export async function getAdminOrders() {
  if (!process.env.DATABASE_URL) return [];

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } }, items: true },
  });

  return orders.map((order) => ({
    ...order,
    total: order.total.toNumber(),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }));
}

export async function getAdminOrder(id: string) {
  if (!process.env.DATABASE_URL) return null;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: true } },
    },
  });

  if (!order) return null;

  return {
    ...order,
    total: order.total.toNumber(),
    items: order.items.map((item) => ({ ...item, price: item.price.toNumber() })),
  };
}

export async function getAdminCategories() {
  if (!process.env.DATABASE_URL) return [];

  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
}

export async function getAdminUsers() {
  if (!process.env.DATABASE_URL) return [];

  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
}

export async function getAdminReviews() {
  if (!process.env.DATABASE_URL) return [];

  return prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, slug: true } },
    },
  });
}

export { OrderStatus, ProductStatus };
