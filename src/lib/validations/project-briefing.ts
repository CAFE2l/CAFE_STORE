import { z } from 'zod';
import { isValidPhoneNumber } from 'react-phone-number-input/min';
import { SERVICES, SERVICE_KEYS, isServiceKey } from '@/data/services';

const serviceKeys = SERVICE_KEYS as [string, ...string[]];

export const briefingSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(120, 'Nome muito longo'),
  email: z.string().email('Informe um e-mail válido'),
  whatsapp: z.string()
    .min(1, 'WhatsApp é obrigatório')
    .refine(
      (val) => isValidPhoneNumber(val),
      { message: 'Número de telefone inválido para o país selecionado' },
    ),
  companyName: z.string().optional(),
  serviceType: z.enum(serviceKeys, { message: 'Selecione o serviço desejado' }),
  serviceName: z.string().optional(),
  budget: z.string().min(1, 'Selecione uma faixa de orçamento'),
  deadline: z.string().min(1, 'Selecione o prazo desejado'),
  projectDescription: z
    .string()
    .min(30, 'Descreva um pouco mais — mín. 30 caracteres')
    .max(500, 'Máximo de 500 caracteres'),
  mainGoal: z.string().optional(),
  targetAudience: z.string().optional(),
  references: z.string().optional(),
  desiredFeatures: z.array(z.string()).default([]),
  hasDomain: z.boolean().optional(),
  hasHosting: z.boolean().optional(),
  hasBranding: z.boolean().optional(),
  preferredContact: z.enum(['whatsapp', 'email']).optional(),
  extraNotes: z.string().optional(),

  landingPageGoal: z.string().optional(),
  landingPageProduct: z.string().optional(),
  landingPageNeedsForm: z.boolean().optional(),
  landingPageNeedsWhatsapp: z.boolean().optional(),
  landingPageNeedsLeadCapture: z.boolean().optional(),
  landingPageNeedsEmailMarketing: z.boolean().optional(),

  sitePagesCount: z.coerce.number().int().optional(),
  sitePagesList: z.array(z.string()).optional(),
  siteNeedsAdmin: z.boolean().optional(),
  siteNeedsBlog: z.boolean().optional(),
  siteNeedsSeo: z.boolean().optional(),

  appNeedsLogin: z.boolean().optional(),
  appNeedsAdmin: z.boolean().optional(),
  appNeedsDatabase: z.boolean().optional(),
  appNeedsApi: z.boolean().optional(),
  appNeedsPayments: z.boolean().optional(),
  appUserTypesCount: z.coerce.number().int().optional(),
  appMainFeatures: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!isServiceKey(data.serviceType)) return;

  const service = SERVICES[data.serviceType];
  const validBudgets: readonly string[] = service.orcamentos;
  const validDeadlines: readonly string[] = service.prazos;

  if (!validBudgets.includes(data.budget)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['budget'],
      message: `Orçamento inválido para ${service.label}`,
    });
  }

  if (!validDeadlines.includes(data.deadline)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['deadline'],
      message: `Prazo inválido para ${service.label}`,
    });
  }
});

export type BriefingInput = z.infer<typeof briefingSchema>;

export { SERVICES };
