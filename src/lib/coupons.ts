import { prisma } from '@/lib/prisma';

export type CouponValidationResult = {
  valid: boolean;
  discount: number;
  finalTotal: number;
  message: string;
  coupon?: {
    id: string;
    code: string;
    type: string;
    discount: number;
  };
};

export function calculateCouponDiscount(
  coupon: {
    type: string;
    discount: number;
    maxDiscount?: number | null;
    minAmount?: number | null;
  },
  cartTotal: number,
): { discount: number; finalTotal: number } {
  if (coupon.type === 'FREE_SHIPPING') {
    return { discount: 0, finalTotal: cartTotal };
  }

  if (coupon.type === 'FIXED') {
    const discount = Math.min(coupon.discount, cartTotal);
    return { discount, finalTotal: cartTotal - discount };
  }

  if (coupon.type === 'PERCENTAGE') {
    let discount = cartTotal * (coupon.discount / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
    return {
      discount: Math.round(discount * 100) / 100,
      finalTotal: Math.max(0, cartTotal - discount),
    };
  }

  return { discount: 0, finalTotal: cartTotal };
}

export async function validateCoupon(
  code: string,
  cartTotal: number,
  userId?: string,
): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!coupon) {
    return { valid: false, discount: 0, finalTotal: cartTotal, message: 'Cupom não encontrado.' };
  }

  if (!coupon.active) {
    return { valid: false, discount: 0, finalTotal: cartTotal, message: 'Este cupom está inativo.' };
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return { valid: false, discount: 0, finalTotal: cartTotal, message: 'Este cupom já expirou.' };
  }

  if (coupon.startsAt && new Date() < coupon.startsAt) {
    return { valid: false, discount: 0, finalTotal: cartTotal, message: 'Este cupom ainda não está válido.' };
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discount: 0, finalTotal: cartTotal, message: 'Este cupom já atingiu o limite de usos.' };
  }

  if (coupon.minAmount && cartTotal < coupon.minAmount.toNumber()) {
    return {
      valid: false,
      discount: 0,
      finalTotal: cartTotal,
      message: `Valor mínimo do pedido: R$ ${coupon.minAmount.toNumber().toFixed(2)}.`,
    };
  }

  if (userId && coupon.usagePerUser) {
    const usageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (usageCount >= coupon.usagePerUser) {
      return {
        valid: false,
        discount: 0,
        finalTotal: cartTotal,
        message: `Você já utilizou este cupom ${usageCount} vez(es).`,
      };
    }
  }

  const discountData = calculateCouponDiscount(
    {
      type: coupon.type,
      discount: coupon.discount.toNumber(),
      maxDiscount: coupon.maxDiscount?.toNumber() ?? null,
      minAmount: coupon.minAmount?.toNumber() ?? null,
    },
    cartTotal,
  );

  return {
    valid: true,
    ...discountData,
    message: `Cupom aplicado: ${coupon.code}`,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount.toNumber(),
    },
  };
}
