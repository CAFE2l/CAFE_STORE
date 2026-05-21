import { z } from 'zod';

export const credentialsSchema = z.object({
  email: z.string().email('Informe um e-mail valido.'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
});

export const registerSchema = credentialsSchema
  .extend({
    name: z.string().min(2, 'Informe seu nome.').max(120, 'Nome muito longo.'),
    confirmPassword: z.string().min(6, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas nao conferem.',
    path: ['confirmPassword'],
  });

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, 'Produto invalido.'),
  quantity: z.number().int().min(1, 'Quantidade invalida.'),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .optional(),
});

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'Informe seu nome.'),
    email: z.string().email('Informe um e-mail valido.'),
    phone: z.string().min(8, 'Informe um telefone valido.'),
  }),
  address: z.object({
    street: z.string().min(2, 'Informe a rua.'),
    number: z.string().min(1, 'Informe o numero.'),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, 'Informe o bairro.'),
    city: z.string().min(2, 'Informe a cidade.'),
    state: z.string().min(2, 'Informe o estado.').max(2, 'Use a sigla do estado.'),
    zip: z.string().min(8, 'Informe o CEP.'),
  }),
  paymentMethod: z.enum(['pix', 'mercadopago', 'paypal']),
  items: z.array(checkoutItemSchema).min(1, 'Carrinho vazio.'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const reviewCreateSchema = z.object({
  productId: z.string().min(1, 'Produto invalido.'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000, 'Comentario muito longo.').optional(),
});

export const wishlistToggleSchema = z.object({
  productId: z.string().min(1, 'Produto invalido.'),
});

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type WishlistToggleInput = z.infer<typeof wishlistToggleSchema>;

export const adminProductSchema = z.object({
  name: z.string().min(2, 'Nome obrigatorio.'),
  slug: z.string().min(2, 'Slug obrigatorio.'),
  description: z.string().optional(),
  price: z.number().positive('Preco invalido.'),
  oldPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).default([]),
  categoryId: z.string().min(1, 'Categoria obrigatoria.'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']),
  featured: z.boolean().default(false),
  variants: z.unknown().optional(),
});

export const adminCategorySchema = z.object({
  name: z.string().min(2, 'Nome obrigatorio.'),
  slug: z.string().min(2, 'Slug obrigatorio.'),
  image: z.string().url().optional().or(z.literal('')),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export const adminReviewModerationSchema = z.object({
  approved: z.boolean(),
});
