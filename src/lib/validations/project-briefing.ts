import { z } from 'zod';

const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

const budgetOptions = [
  'Até R$ 1.000',
  'R$ 1.000 - R$ 2.000',
  'R$ 2.000 - R$ 5.000',
  'R$ 5.000 - R$ 10.000',
  'R$ 10.000 - R$ 20.000',
  'Acima de R$ 20.000',
  'Sob consulta',
] as const;

const deadlineOptions = [
  'Urgente (até 7 dias)',
  '15 dias',
  '30 dias',
  '60 dias',
  '90 dias',
  'Sem prazo definido',
] as const;

export const briefingSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(120, 'Nome muito longo'),
  email: z.string().email('Informe um e-mail válido'),
  whatsapp: z.string().min(8, 'Informe um WhatsApp válido'),
  companyName: z.string().optional(),
  serviceType: z.string().min(1, 'Selecione um serviço'),
  serviceName: z.string().optional(),
  budget: z.string().min(1, 'Selecione um orçamento'),
  deadline: z.string().min(1, 'Selecione um prazo'),
  projectDescription: z.string().min(30, 'Descreva o projeto com pelo menos 30 caracteres'),
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
});

export type BriefingInput = z.infer<typeof briefingSchema>;

export { budgetOptions, deadlineOptions };
