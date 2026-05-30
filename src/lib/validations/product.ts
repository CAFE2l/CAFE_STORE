import { ProductStatus } from '@prisma/client';
import { z } from 'zod';

export const productEditSchema = z.object({
  name: z.string().min(2, 'O nome precisa ter pelo menos 2 caracteres.'),
  sku: z
    .string()
    .regex(/^[A-Z0-9-]*$/, 'Use apenas letras maiúsculas, números e hífens.')
    .max(30, 'SKU deve ter no máximo 30 caracteres.')
    .optional(),
  slug: z
    .string()
    .min(2, 'O slug é obrigatório.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens.'),
  description: z.string().optional(),
  shortDescription: z.string().max(300, 'Máximo de 300 caracteres.').optional(),
  price: z.number('Preço inválido').positive('O preço precisa ser maior que zero.'),
  oldPrice: z.number('Preço inválido').optional().nullable(),
  stock: z.number('Estoque inválido').int().min(0, 'O estoque não pode ser negativo.'),
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
  status: z.nativeEnum(ProductStatus),
  featured: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  variants: z.unknown().optional(),
});

export type ProductEditInput = z.infer<typeof productEditSchema>;
