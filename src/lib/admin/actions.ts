'use server';

import { FeedbackPriority, FeedbackStatus, ProductStatus } from '@prisma/client';
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

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Informe o nome da categoria.'),
  slug: z.string().min(2, 'Informe um slug.').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens.'),
  description: z.string().max(500, 'Use até 500 caracteres.').optional().nullable(),
  image: z.string().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
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

export async function createCategoryAction(input: unknown): Promise<ActionState> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'Revise os campos da categoria.', errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        image: parsed.data.image || null,
        isActive: parsed.data.isActive,
      },
    });
    refreshAdmin('/admin/categorias');
    return { ok: true, message: 'Categoria criada com sucesso.' };
  } catch {
    return { ok: false, message: 'Não foi possível criar a categoria. Verifique se o slug já existe.' };
  }
}

export async function updateCategoryAction(input: unknown): Promise<ActionState> {
  const parsed = categorySchema.extend({ id: z.string().min(1) }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: 'Revise os campos da categoria.', errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.category.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        image: parsed.data.image || null,
        isActive: parsed.data.isActive,
      },
    });
    refreshAdmin('/admin/categorias');
    return { ok: true, message: 'Categoria atualizada.' };
  } catch {
    return { ok: false, message: 'Não foi possível atualizar a categoria.' };
  }
}

export async function toggleCategoryStatusAction(categoryId: string): Promise<ActionState> {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { isActive: true } });
  if (!category) return { ok: false, message: 'Categoria não encontrada.' };

  await prisma.category.update({ where: { id: categoryId }, data: { isActive: !category.isActive } });
  refreshAdmin('/admin/categorias');
  return { ok: true, message: category.isActive ? 'Categoria desativada.' : 'Categoria ativada.' };
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionState> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { products: true } } },
  });

  if (!category) return { ok: false, message: 'Categoria não encontrada.' };
  if (category._count.products > 0) {
    return { ok: false, message: 'Não é possível excluir uma categoria com produtos vinculados.' };
  }

  await prisma.category.delete({ where: { id: categoryId } });
  refreshAdmin('/admin/categorias');
  return { ok: true, message: 'Categoria excluída.' };
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

export async function updateFeedbackStatusAction(feedbackId: string, status: FeedbackStatus): Promise<ActionState> {
  await prisma.feedback.update({
    where: { id: feedbackId },
    data: {
      status,
      isApproved: status === FeedbackStatus.APPROVED,
    },
  });
  refreshAdmin('/admin/feedbacks');
  return { ok: true, message: 'Status do feedback atualizado.' };
}

export async function updateFeedbackPriorityAction(feedbackId: string, priority: FeedbackPriority): Promise<ActionState> {
  await prisma.feedback.update({ where: { id: feedbackId }, data: { priority } });
  refreshAdmin('/admin/feedbacks');
  return { ok: true, message: 'Prioridade atualizada.' };
}

export async function deleteFeedbackAction(feedbackId: string): Promise<ActionState> {
  await prisma.feedback.delete({ where: { id: feedbackId } });
  refreshAdmin('/admin/feedbacks');
  return { ok: true, message: 'Feedback excluído.' };
}

export async function updateBriefingStatusAction(
  briefingId: string,
  status: 'PENDING' | 'CONTACTED' | 'IN_NEGOTIATION' | 'APPROVED' | 'REJECTED' | 'ARCHIVED',
): Promise<ActionState> {
  try {
    await prisma.projectBriefing.update({
      where: { id: briefingId },
      data: { status },
    });
    refreshAdmin('/admin/briefings');
    return { ok: true, message: 'Status do briefing atualizado.' };
  } catch {
    return { ok: false, message: 'Erro ao atualizar status.' };
  }
}
