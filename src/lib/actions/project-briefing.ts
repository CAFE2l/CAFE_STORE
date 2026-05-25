'use server';

import { prisma } from '@/lib/prisma';
import { briefingSchema } from '@/lib/validations/project-briefing';
import { generateWhatsAppUrl } from '@/lib/whatsapp';
import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';

export type BriefingActionState = {
  ok: boolean;
  message: string;
  briefingId?: string;
  whatsappUrl?: string;
  errors?: Record<string, string[]>;
};

function sanitize(str: string | undefined | null): string | null {
  if (!str) return null;
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export async function createProjectBriefing(input: unknown): Promise<BriefingActionState> {
  const parsed = briefingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: 'Revise os campos do formulário.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const briefing = await prisma.projectBriefing.create({
      data: {
        name: sanitize(data.name) || data.name,
        email: data.email.toLowerCase().trim(),
        whatsapp: data.whatsapp.replace(/\D/g, ''),
        companyName: sanitize(data.companyName),
        serviceSlug: data.serviceType,
        serviceName: data.serviceName || data.serviceType,
        budget: data.budget || null,
        deadline: data.deadline || null,
        projectDescription: sanitize(data.projectDescription) || data.projectDescription,
        mainGoal: sanitize(data.mainGoal),
        targetAudience: sanitize(data.targetAudience),
        references: sanitize(data.references),
        desiredFeatures: (data.desiredFeatures || []) as unknown as Prisma.InputJsonValue,
        hasDomain: data.hasDomain ?? null,
        hasHosting: data.hasHosting ?? null,
        hasBranding: data.hasBranding ?? null,
        preferredContact: data.preferredContact || null,
        extraNotes: sanitize(data.extraNotes),

        landingPageGoal: sanitize(data.landingPageGoal),
        landingPageProduct: sanitize(data.landingPageProduct),
        landingPageNeedsForm: data.landingPageNeedsForm ?? null,
        landingPageNeedsWhatsapp: data.landingPageNeedsWhatsapp ?? null,
        landingPageNeedsLeadCapture: data.landingPageNeedsLeadCapture ?? null,
        landingPageNeedsEmailMarketing: data.landingPageNeedsEmailMarketing ?? null,

        sitePagesCount: data.sitePagesCount ?? null,
        sitePagesList: (data.sitePagesList ?? null) as unknown as Prisma.InputJsonValue,
        siteNeedsAdmin: data.siteNeedsAdmin ?? null,
        siteNeedsBlog: data.siteNeedsBlog ?? null,
        siteNeedsSeo: data.siteNeedsSeo ?? null,

        appNeedsLogin: data.appNeedsLogin ?? null,
        appNeedsAdmin: data.appNeedsAdmin ?? null,
        appNeedsDatabase: data.appNeedsDatabase ?? null,
        appNeedsApi: data.appNeedsApi ?? null,
        appNeedsPayments: data.appNeedsPayments ?? null,
        appUserTypesCount: data.appUserTypesCount ?? null,
        appMainFeatures: sanitize(data.appMainFeatures),
      },
    });

    const whatsappUrl = generateWhatsAppUrl(data);

    revalidatePath('/admin/briefings');

    return {
      ok: true,
      message: 'Briefing enviado com sucesso!',
      briefingId: briefing.id,
      whatsappUrl,
    };
  } catch (error) {
    console.error('Error creating briefing:', error);
    return {
      ok: false,
      message: 'Erro ao salvar o briefing. Tente novamente.',
    };
  }
}

export async function updateBriefingStatusAction(
  briefingId: string,
  status: 'PENDING' | 'CONTACTED' | 'IN_NEGOTIATION' | 'APPROVED' | 'REJECTED' | 'ARCHIVED',
): Promise<BriefingActionState> {
  try {
    await prisma.projectBriefing.update({
      where: { id: briefingId },
      data: { status },
    });
    revalidatePath('/admin/briefings');
    return { ok: true, message: 'Status atualizado com sucesso.' };
  } catch {
    return { ok: false, message: 'Erro ao atualizar status.' };
  }
}
