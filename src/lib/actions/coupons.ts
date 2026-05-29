'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { couponCreateSchema } from '@/lib/validations/coupon';

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

function refresh() {
  revalidatePath('/admin/cupons');
  revalidatePath('/admin/dashboard');
}

export async function getCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { usages: true } } },
  });
}

export async function getCouponById(id: string) {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: { _count: { select: { usages: true } } },
  });
  if (!coupon) return null;
  return {
    ...coupon,
    discount: coupon.discount.toNumber(),
    minAmount: coupon.minAmount?.toNumber() ?? null,
    maxDiscount: coupon.maxDiscount?.toNumber() ?? null,
  };
}

export async function getCouponMetrics() {
  const now = new Date();

  const [total, active, expired, totalUsages] = await Promise.all([
    prisma.coupon.count(),
    prisma.coupon.count({ where: { active: true, OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] } }),
    prisma.coupon.count({ where: { expiresAt: { not: null, lt: now } } }),
    prisma.coupon.aggregate({ _sum: { usedCount: true } }),
  ]);

  return {
    total,
    active,
    expired,
    totalUsages: totalUsages._sum.usedCount ?? 0,
  };
}

export async function createCouponAction(input: unknown): Promise<ActionState> {
  const parsed = couponCreateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Revise os campos do cupom.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.coupon.findUnique({
    where: { code: parsed.data.code },
    select: { id: true },
  });

  if (existing) {
    return { ok: false, message: 'Este código de cupom já existe.' };
  }

  try {
    await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        name: parsed.data.name || null,
        description: parsed.data.description || null,
        type: parsed.data.type,
        discount: parsed.data.discount,
        minAmount: parsed.data.minAmount ?? null,
        maxDiscount: parsed.data.maxDiscount ?? null,
        maxUses: parsed.data.maxUses ?? 0,
        usagePerUser: parsed.data.usagePerUser ?? null,
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        active: parsed.data.active,
      },
    });

    refresh();
    return { ok: true, message: 'Cupom criado com sucesso.' };
  } catch {
    return { ok: false, message: 'Erro ao criar cupom. Verifique os dados.' };
  }
}

export async function updateCouponAction(id: string, input: unknown): Promise<ActionState> {
  const parsed = couponCreateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Revise os campos do cupom.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.coupon.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return { ok: false, message: 'Cupom não encontrado.' };
  }

  const codeConflict = await prisma.coupon.findFirst({
    where: { code: parsed.data.code, id: { not: id } },
    select: { id: true },
  });
  if (codeConflict) {
    return { ok: false, message: 'Este código de cupom já está em uso por outro cupom.' };
  }

  try {
    await prisma.coupon.update({
      where: { id },
      data: {
        code: parsed.data.code,
        name: parsed.data.name || null,
        description: parsed.data.description || null,
        type: parsed.data.type,
        discount: parsed.data.discount,
        minAmount: parsed.data.minAmount ?? null,
        maxDiscount: parsed.data.maxDiscount ?? null,
        maxUses: parsed.data.maxUses ?? 0,
        usagePerUser: parsed.data.usagePerUser ?? null,
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        active: parsed.data.active,
      },
    });

    refresh();
    return { ok: true, message: 'Cupom atualizado com sucesso.' };
  } catch {
    return { ok: false, message: 'Erro ao atualizar cupom.' };
  }
}

export async function deleteCouponAction(id: string): Promise<ActionState> {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    select: { usedCount: true, code: true },
  });

  if (!coupon) {
    return { ok: false, message: 'Cupom não encontrado.' };
  }

  if (coupon.usedCount > 0) {
    await prisma.coupon.update({
      where: { id },
      data: { active: false },
    });
    refresh();
    return {
      ok: true,
      message: `O cupom "${coupon.code}" já possui ${coupon.usedCount} uso(s) e foi apenas desativado. Considere mantê-lo para não quebrar registros históricos.`,
    };
  }

  try {
    await prisma.coupon.delete({ where: { id } });
    refresh();
    return { ok: true, message: 'Cupom excluído com sucesso.' };
  } catch {
    return { ok: false, message: 'Erro ao excluir cupom.' };
  }
}

export async function toggleCouponStatusAction(id: string): Promise<ActionState> {
  const coupon = await prisma.coupon.findUnique({
    where: { id },
    select: { active: true },
  });

  if (!coupon) {
    return { ok: false, message: 'Cupom não encontrado.' };
  }

  await prisma.coupon.update({
    where: { id },
    data: { active: !coupon.active },
  });

  refresh();
  return {
    ok: true,
    message: coupon.active ? 'Cupom desativado.' : 'Cupom ativado.',
  };
}
