import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ success: false, error: 'Banco nao configurado.' }, { status: 503 });
  }

  const body = await request.json();
  const code = (body.code as string ?? '').trim().toUpperCase();

  if (!code) {
    return Response.json({ success: false, error: 'Codigo do cupom obrigatorio.' }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code },
  });

  if (!coupon) {
    return Response.json({ success: false, error: 'Cupom nao encontrado.' }, { status: 404 });
  }

  if (!coupon.active) {
    return Response.json({ success: false, error: 'Cupom inativo.' }, { status: 400 });
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return Response.json({ success: false, error: 'Cupom expirado.' }, { status: 400 });
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return Response.json({ success: false, error: 'Cupom esgotado.' }, { status: 400 });
  }

  return Response.json({
    success: true,
    data: {
      id: coupon.id,
      code: coupon.code,
      discount: coupon.discount.toNumber(),
      type: coupon.type,
      minAmount: coupon.minAmount?.toNumber() ?? null,
    },
  });
}
