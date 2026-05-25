import { OrderStatus, ProductStatus, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 10;

function money(value: { toNumber(): number } | number | null | undefined) {
  if (!value) return 0;
  return typeof value === 'number' ? value : value.toNumber();
}

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getDashboardData() {
  if (!process.env.DATABASE_URL) {
    return {
      metrics: {
        revenueToday: 0,
        ordersToday: 0,
        monthlyRevenue: 0,
        activeProducts: 0,
        users: 0,
        pendingReviews: 0,
      },
      weeklyRevenue: [],
      orderStatus: [],
      recentOrders: [],
      topProducts: [],
    };
  }

  const today = startOfDay();
  const tomorrow = addDays(today, 1);
  const weekStart = addDays(today, -6);
  const monthStart = startOfMonth();

  const [
    revenueToday,
    ordersToday,
    monthlyRevenue,
    activeProducts,
    users,
    pendingReviews,
    recentOrders,
    orderStatus,
    weeklyRevenueRaw,
    topItems,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: today, lt: tomorrow }, status: { not: OrderStatus.CANCELLED } },
    }),
    prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: monthStart }, status: { not: OrderStatus.CANCELLED } },
    }),
    prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.review.count({ where: { approved: false } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.$queryRaw<Array<{ day: Date; revenue: unknown; orders: bigint }>>`
      SELECT date_trunc('day', "createdAt") AS day, COALESCE(SUM(total), 0) AS revenue, COUNT(*) AS orders
      FROM "Order"
      WHERE "createdAt" >= ${weekStart} AND status != 'CANCELLED'
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  const topProducts = await prisma.product.findMany({
    where: { id: { in: topItems.map((item) => item.productId) } },
    select: { id: true, name: true, price: true, images: true, status: true },
  });

  const topProductsById = new Map(topProducts.map((product) => [product.id, product]));
  const revenueByDay = new Map(
    weeklyRevenueRaw.map((item) => [
      item.day.toISOString().slice(0, 10),
      { revenue: Number(item.revenue), orders: Number(item.orders) },
    ]),
  );

  return {
    metrics: {
      revenueToday: money(revenueToday._sum.total),
      ordersToday,
      monthlyRevenue: money(monthlyRevenue._sum.total),
      activeProducts,
      users,
      pendingReviews,
    },
    weeklyRevenue: Array.from({ length: 7 }, (_, index) => {
      const day = addDays(weekStart, index);
      const key = day.toISOString().slice(0, 10);
      return {
        date: key,
        label: day.toLocaleDateString('pt-BR', { weekday: 'short' }),
        revenue: revenueByDay.get(key)?.revenue ?? 0,
        orders: revenueByDay.get(key)?.orders ?? 0,
      };
    }),
    orderStatus: orderStatus.map((item) => ({ status: item.status, total: item._count.status })),
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      status: order.status,
      total: money(order.total),
      createdAt: order.createdAt,
      customer: order.user.name ?? order.user.email,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    })),
    topProducts: topItems.map((item) => {
      const product = topProductsById.get(item.productId);
      return {
        id: item.productId,
        name: product?.name ?? 'Produto removido',
        image: product?.images?.[0] ?? null,
        status: product?.status ?? ProductStatus.INACTIVE,
        revenue: money(product?.price) * (item._sum.quantity ?? 0),
        quantity: item._sum.quantity ?? 0,
      };
    }),
  };
}

export async function getProductsPage(searchParams?: Record<string, string | string[] | undefined>) {
  const q = String(searchParams?.q ?? '').trim();
  const status = String(searchParams?.status ?? 'all');
  const page = Math.max(Number(searchParams?.page ?? 1), 1);

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { slug: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(status !== 'all' ? { status: status as ProductStatus } : {}),
  };

  const [items, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: true,
        _count: { select: { orderItems: true, reviews: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return {
    items: items.map((product) => ({
      ...product,
      price: money(product.price),
      oldPrice: money(product.oldPrice),
    })),
    categories,
    page,
    pageSize: PAGE_SIZE,
    total,
  };
}

export async function getOrdersPage(searchParams?: Record<string, string | string[] | undefined>) {
  const q = String(searchParams?.q ?? '').trim();
  const status = String(searchParams?.status ?? 'all');
  const page = Math.max(Number(searchParams?.page ?? 1), 1);

  const where = {
    ...(status !== 'all' ? { status: status as OrderStatus } : {}),
    ...(q
      ? {
          OR: [
            { id: { contains: q, mode: 'insensitive' as const } },
            { user: { email: { contains: q, mode: 'insensitive' as const } } },
            { user: { name: { contains: q, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { quantity: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items: items.map((order) => ({
      ...order,
      total: money(order.total),
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    })),
    page,
    pageSize: PAGE_SIZE,
    total,
  };
}

export async function getUsersPage(searchParams?: Record<string, string | string[] | undefined>) {
  const q = String(searchParams?.q ?? '').trim();
  const role = String(searchParams?.role ?? 'all');
  const page = Math.max(Number(searchParams?.page ?? 1), 1);
  const where = {
    deletedAt: null,
    ...(role !== 'all' ? { role: role as Role } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
            { cpf: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, page, pageSize: PAGE_SIZE, total };
}

export async function getCategoriesPage() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
}

export async function getCouponsPage() {
  return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getReviewsPage() {
  return prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true } },
    },
  });
}

export async function getFeedbacksPage() {
  return prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getBannersPage() {
  return prisma.banner.findMany({ orderBy: [{ position: 'asc' }, { createdAt: 'desc' }] });
}

