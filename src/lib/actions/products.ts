'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { productEditSchema } from '@/lib/validations/product';

export type ActionState = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) return null;

  return {
    ...product,
    price: product.price.toNumber(),
    oldPrice: product.oldPrice?.toNumber() ?? null,
  };
}

export async function getCategoriesForSelect() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

export async function updateProductAction(
  id: string,
  input: unknown,
): Promise<ActionState> {
  const parsed = productEditSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Revise os campos do produto.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false, message: 'Produto não encontrado.' };
  }

  const slugConflict = await prisma.product.findFirst({
    where: { slug: parsed.data.slug, id: { not: id } },
    select: { id: true },
  });

  if (slugConflict) {
    return { ok: false, message: 'Este slug já está em uso por outro produto.' };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || null,
        shortDescription: parsed.data.shortDescription || null,
        price: parsed.data.price,
        oldPrice: parsed.data.oldPrice || null,
        stock: parsed.data.stock,
        categoryId: parsed.data.categoryId,
        status: parsed.data.status,
        featured: parsed.data.featured,
        images: parsed.data.images,
        variants: parsed.data.variants ?? undefined,
      },
    });

    revalidatePath('/admin/produtos');
    revalidatePath(`/admin/produtos/${id}/editar`);
    return { ok: true, message: 'Produto atualizado com sucesso.' };
  } catch {
    return { ok: false, message: 'Erro ao salvar. Verifique os dados e tente novamente.' };
  }
}
