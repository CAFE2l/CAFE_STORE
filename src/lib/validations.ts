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
