import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: [{ active: 'desc' }, { expiresAt: 'asc' }],
  });

  return Response.json({
    success: true,
    data: coupons.map((coupon) => ({
      code: coupon.code,
      discount_type: coupon.type === 'FIXED' ? 'fixed' : 'percent',
      value: coupon.discount.toNumber(),
      expires_at: coupon.expiresAt?.toISOString() ?? null,
      is_used: coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses,
      min_order_value: coupon.minAmount?.toNumber() ?? null,
      active: coupon.active,
    })),
  });
}
