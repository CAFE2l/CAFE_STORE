'use client';

import type { ProjectBriefing, BriefingStatus } from '@prisma/client';
import { X, MessageCircle, ExternalLink } from 'lucide-react';
import { dateTime } from '@/lib/admin/formatters';
import { generateWhatsAppUrl } from '@/lib/whatsapp';

type Props = {
  briefing: ProjectBriefing;
  onClose: () => void;
};

const statusLabel: Record<string, string> = {
  PENDING: 'Pendente',
  CONTACTED: 'Contatado',
  IN_NEGOTIATION: 'Em negociação',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  ARCHIVED: 'Arquivado',
};

const statusClasses: Record<string, string> = {
  PENDING: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  CONTACTED: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  IN_NEGOTIATION: 'border-purple-400/20 bg-purple-400/10 text-purple-200',
  APPROVED: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  REJECTED: 'border-red-400/20 bg-red-400/10 text-red-200',
  ARCHIVED: 'border-zinc-600 bg-zinc-900 text-zinc-300',
};

export function BriefingDetailsDialog({ briefing, onClose }: Props) {
  const features = briefing.desiredFeatures as string[] | null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">{briefing.name}</h2>
            <p className="mt-1 text-sm text-zinc-500">{briefing.email} • {briefing.whatsapp}</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 hover:text-white" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 p-5">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[briefing.status]}`}>
              {statusLabel[briefing.status]}
            </span>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300">
              {briefing.serviceName}
            </span>
          </div>

          <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
            <h3 className="font-semibold text-white">Informações do projeto</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <Info label="Empresa" value={briefing.companyName} />
              <Info label="Orçamento" value={briefing.budget} />
              <Info label="Prazo" value={briefing.deadline} />
              <Info label="Preferência de contato" value={briefing.preferredContact === 'whatsapp' ? 'WhatsApp' : briefing.preferredContact === 'email' ? 'E-mail' : undefined} />
              <Info label="Domínio" value={briefing.hasDomain === true ? 'Sim' : briefing.hasDomain === false ? 'Não' : undefined} />
              <Info label="Hospedagem" value={briefing.hasHosting === true ? 'Sim' : briefing.hasHosting === false ? 'Não' : undefined} />
              <Info label="Identidade visual" value={briefing.hasBranding === true ? 'Sim' : briefing.hasBranding === false ? 'Não' : undefined} />
              <Info label="Data de envio" value={dateTime.format(briefing.createdAt)} />
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
            <h3 className="font-semibold text-white">Descrição do projeto</h3>
            <p className="whitespace-pre-wrap leading-7 text-zinc-300">{briefing.projectDescription}</p>
          </div>

          {briefing.mainGoal ? (
            <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <h3 className="font-semibold text-white">Objetivo principal</h3>
              <p className="whitespace-pre-wrap leading-7 text-zinc-300">{briefing.mainGoal}</p>
            </div>
          ) : null}

          {briefing.targetAudience ? (
            <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <h3 className="font-semibold text-white">Público-alvo</h3>
              <p className="text-zinc-300">{briefing.targetAudience}</p>
            </div>
          ) : null}

          {briefing.references ? (
            <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <h3 className="font-semibold text-white">Referências</h3>
              <p className="whitespace-pre-wrap text-zinc-300">{briefing.references}</p>
            </div>
          ) : null}

          {features && features.length > 0 ? (
            <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <h3 className="font-semibold text-white">Funcionalidades desejadas</h3>
              <div className="flex flex-wrap gap-2">
                {features.map((feature: string) => (
                  <span key={feature} className="rounded-lg border border-brand/30 bg-brand/[0.08] px-3 py-1.5 text-xs font-medium text-brand">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {briefing.extraNotes ? (
            <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
              <h3 className="font-semibold text-white">Observações</h3>
              <p className="whitespace-pre-wrap text-zinc-300">{briefing.extraNotes}</p>
            </div>
          ) : null}

          <a
            href={generateWhatsAppUrl({
              name: briefing.name,
              email: briefing.email,
              whatsapp: briefing.whatsapp,
              serviceType: briefing.serviceSlug,
              serviceName: briefing.serviceName,
              projectDescription: briefing.projectDescription,
              budget: briefing.budget || undefined,
              deadline: briefing.deadline || undefined,
              companyName: briefing.companyName || undefined,
              mainGoal: briefing.mainGoal || undefined,
              targetAudience: briefing.targetAudience || undefined,
              references: briefing.references || undefined,
              desiredFeatures: features || [],
              hasDomain: briefing.hasDomain || undefined,
              hasHosting: briefing.hasHosting || undefined,
              hasBranding: briefing.hasBranding || undefined,
              preferredContact: (briefing.preferredContact as 'whatsapp' | 'email') || undefined,
              extraNotes: briefing.extraNotes || undefined,
            })}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-led-brand transition hover:bg-brand-light"
          >
            <MessageCircle className="h-4 w-4" />
            Abrir no WhatsApp
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs text-zinc-500">{label}</span>
      <p className="mt-0.5 font-medium text-white">{value}</p>
    </div>
  );
}
