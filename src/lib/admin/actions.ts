'use server';

import { ProductStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const productSchema = z.object({
  name: z.string().min(3, 'Informe ao menos 3 caracteres.'),
  slug: z.string().min(3).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use um slug URL-safe.'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Informe um preço válido.'),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
  status: z.nativeEnum(ProductStatus),
  featured: z.coerce.boolean().optional(),
});

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

function refreshAdmin(path = '/admin/produtos') {
  revalidatePath('/admin/dashboard');
  revalidatePath(path);
  revalidatePath('/api/admin/dashboard');
}

export async function createProductAction(input: unknown): Promise<ActionState> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'Revise os campos do produto.', errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.product.create({
      data: {
        ...parsed.data,
        price: parsed.data.price,
        featured: Boolean(parsed.data.featured),
        images: [],
      },
    });
    refreshAdmin();
    return { ok: true, message: 'Produto criado com sucesso.' };
  } catch {
    return { ok: false, message: 'Não foi possível criar o produto. Verifique se o slug já existe.' };
  }
}

export async function toggleProductStatusAction(productId: string): Promise<ActionState> {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { status: true } });
  if (!product) return { ok: false, message: 'Produto não encontrado.' };

  await prisma.product.update({
    where: { id: productId },
    data: { status: product.status === ProductStatus.ACTIVE ? ProductStatus.INACTIVE : ProductStatus.ACTIVE },
  });

  refreshAdmin();
  return { ok: true, message: 'Status do produto atualizado.' };
}

export async function deleteProductAction(productId: string): Promise<ActionState> {
  try {
    await prisma.product.delete({ where: { id: productId } });
    refreshAdmin();
    return { ok: true, message: 'Produto removido.' };
  } catch {
    return { ok: false, message: 'Produto possui vínculos e não pode ser removido agora.' };
  }
}

export async function approveReviewAction(reviewId: string): Promise<ActionState> {
  await prisma.review.update({ where: { id: reviewId }, data: { approved: true } });
  refreshAdmin('/admin/avaliacoes');
  return { ok: true, message: 'Avaliação aprovada.' };
}

export async function toggleBannerAction(bannerId: string): Promise<ActionState> {
  const banner = await prisma.banner.findUnique({ where: { id: bannerId }, select: { active: true } });
  if (!banner) return { ok: false, message: 'Banner não encontrado.' };

  await prisma.banner.update({ where: { id: bannerId }, data: { active: !banner.active } });
  refreshAdmin('/admin/banners');
  return { ok: true, message: 'Banner atualizado.' };
}

