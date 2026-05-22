import { z } from 'zod';

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function isValidCpf(value: string) {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (base: string, factor: number) => {
    const total = base
      .split('')
      .reduce((sum, digit) => sum + Number(digit) * factor--, 0);
    const result = (total * 10) % 11;
    return result === 10 ? 0 : result;
  };

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11);

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10]);
}

const strongPasswordSchema = z
  .string()
  .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
  .regex(/[A-Z]/, 'A senha precisa ter pelo menos uma letra maiuscula.')
  .regex(/\d/, 'A senha precisa ter pelo menos um numero.')
  .regex(/[^A-Za-z0-9]/, 'A senha precisa ter pelo menos um caractere especial.');

export const credentialsSchema = z.object({
  email: z.string().email('Informe um e-mail valido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Informe seu nome completo.').max(120, 'Nome muito longo.'),
    email: z.string().email('Informe um e-mail valido.'),
    cpf: z.string().refine(isValidCpf, 'Informe um CPF valido.'),
    phone: z.string().transform(onlyDigits).refine((value) => value.length >= 10 && value.length <= 11, {
      message: 'Informe um telefone valido.',
    }),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas nao conferem.',
    path: ['confirmPassword'],
  });

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const emailVerificationSchema = z.object({
  email: z.string().email('Informe um e-mail valido.'),
  token: z.string().min(32, 'Token invalido.'),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Informe um e-mail valido.'),
});

export const passwordResetSchema = z
  .object({
    email: z.string().email('Informe um e-mail valido.'),
    token: z.string().min(32, 'Token invalido.'),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas nao conferem.',
    path: ['confirmPassword'],
  });

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

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
