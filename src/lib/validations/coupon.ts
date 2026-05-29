import { z } from 'zod';

export const couponCreateSchema = z.object({
  code: z
    .string()
    .min(3, 'O código precisa ter pelo menos 3 caracteres.')
    .max(30, 'Máximo de 30 caracteres.')
    .regex(/^[A-Za-z0-9]+$/, 'Use apenas letras e números, sem espaços.')
    .transform((v) => v.toUpperCase().trim()),
  name: z.string().optional(),
  description: z.string().max(500, 'Máximo de 500 caracteres.').optional(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
  discount: z.number('Valor do desconto é obrigatório').min(0, 'O desconto não pode ser negativo.'),
  minAmount: z.number().optional().nullable(),
  maxDiscount: z.number().optional().nullable(),
  maxUses: z.number().int().optional().nullable(),
  usagePerUser: z.number().int().optional().nullable(),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  active: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.type === 'PERCENTAGE' && data.discount > 100) return false;
    return true;
  },
  { message: 'Porcentagem não pode ultrapassar 100%.', path: ['discount'] },
).refine(
  (data) => {
    if (data.startsAt && data.expiresAt && data.startsAt >= data.expiresAt) return false;
    return true;
  },
  { message: 'A data de expiração precisa ser posterior à data de início.', path: ['expiresAt'] },
);

export const couponEditSchema = couponCreateSchema.safeExtend({
  code: z
    .string()
    .min(3, 'O código precisa ter pelo menos 3 caracteres.')
    .max(30, 'Máximo de 30 caracteres.')
    .regex(/^[A-Za-z0-9]+$/, 'Use apenas letras e números, sem espaços.')
    .transform((v) => v.toUpperCase().trim()),
});

export type CouponCreateInput = z.infer<typeof couponCreateSchema>;
export type CouponEditInput = z.infer<typeof couponEditSchema>;
