'use client';

import { useState, useTransition } from 'react';
import type { ProjectBriefing, BriefingStatus } from '@prisma/client';
import { Search, Eye, MessageCircle, Check, X, Archive, PhoneCall, Handshake } from 'lucide-react';
import { updateBriefingStatusAction } from '@/lib/admin/actions';
import { dateTime } from '@/lib/admin/formatters';
import { cn } from '@/lib/utils';
import { BriefingDetailsDialog } from '@/components/admin/briefing-details-dialog';
import { generateWhatsAppUrl } from '@/lib/whatsapp';

type BriefingItem = ProjectBriefing;

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

type Props = {
  briefings: BriefingItem[];
  filters: { q: string; status: string };
};

export function BriefingsTable({ briefings, filters }: Props) {
  const [selected, setSelected] = useState<BriefingItem | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  }

  function changeStatus(briefing: BriefingItem, status: BriefingStatus) {
    startTransition(async () => {
      const result = await updateBriefingStatusAction(briefing.id, status);
      showToast(result.ok ? 'success' : 'error', result.message);
      if (selected?.id === briefing.id) setSelected({ ...briefing, status });
    });
  }

  return (
    <div className="grid gap-5">
      {toast ? (
        <div className={cn(
          'fixed right-5 top-20 z-[90] rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur',
          toast.type === 'success' ? 'border-emerald-400/20 bg-emerald-500/15 text-emerald-100' : 'border-red-400/20 bg-red-500/15 text-red-100',
        )}>
          {toast.message}
        </div>
      ) : null}

      <form className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/25 p-3 backdrop-blur md:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Buscar por nome, email ou empresa..."
            className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white outline-none transition focus:border-orange-400/60"
          />
        </label>
        <select
          name="status"
          defaultValue={filters.status}
          className="h-11 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-orange-400/60"
        >
          <option value="all">Todos os status</option>
          <option value="PENDING">Pendentes</option>
          <option value="CONTACTED">Contatados</option>
          <option value="IN_NEGOTIATION">Em negociação</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Rejeitados</option>
          <option value="ARCHIVED">Arquivados</option>
        </select>
        <button className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white shadow-led-brand transition hover:bg-orange-400">
          Filtrar
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25 shadow-card backdrop-blur">
        {briefings.length ? (
          <div className="divide-y divide-white/10">
            {briefings.map((briefing) => (
              <article key={briefing.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[1.5fr_1fr_auto] xl:items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-white">{briefing.name}</h2>
                    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase', statusClasses[briefing.status])}>
                      {statusLabel[briefing.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">{briefing.email} • {briefing.whatsapp}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span>{briefing.serviceName}</span>
                    {briefing.budget ? <span>• {briefing.budget}</span> : null}
                    <span>• {dateTime.format(briefing.createdAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <IconButton label="Abrir WhatsApp" onClick={() => window.open(generateWhatsAppUrl({
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
                    desiredFeatures: (briefing.desiredFeatures as string[]) || [],
                    hasDomain: briefing.hasDomain || undefined,
                    hasHosting: briefing.hasHosting || undefined,
                    hasBranding: briefing.hasBranding || undefined,
                    preferredContact: (briefing.preferredContact as 'whatsapp' | 'email') || undefined,
                    extraNotes: briefing.extraNotes || undefined,
                  }), '_blank')}>
                    <MessageCircle className="h-4 w-4" />
                  </IconButton>
                  <IconButton label="Detalhes" onClick={() => setSelected(briefing)}>
                    <Eye className="h-4 w-4" />
                  </IconButton>
                </div>

                <div className="flex flex-wrap gap-2">
                  {briefing.status === 'PENDING' ? (
                    <>
                      <IconButton label="Contatado" onClick={() => changeStatus(briefing, 'CONTACTED')}><PhoneCall className="h-4 w-4" /></IconButton>
                      <IconButton label="Aprovar" onClick={() => changeStatus(briefing, 'APPROVED')}><Check className="h-4 w-4" /></IconButton>
                      <IconButton label="Rejeitar" onClick={() => changeStatus(briefing, 'REJECTED')} danger><X className="h-4 w-4" /></IconButton>
                    </>
                  ) : null}
                  {briefing.status === 'CONTACTED' ? (
                    <IconButton label="Em negociação" onClick={() => changeStatus(briefing, 'IN_NEGOTIATION')}><Handshake className="h-4 w-4" /></IconButton>
                  ) : null}
                  {briefing.status !== 'ARCHIVED' && briefing.status !== 'REJECTED' ? (
                    <IconButton label="Arquivar" onClick={() => changeStatus(briefing, 'ARCHIVED')}><Archive className="h-4 w-4" /></IconButton>
                  ) : null}
                  {briefing.status === 'REJECTED' || briefing.status === 'ARCHIVED' ? (
                    <IconButton label="Reabrir" onClick={() => changeStatus(briefing, 'PENDING')}><Check className="h-4 w-4" /></IconButton>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid place-items-center px-6 py-16 text-center">
            <p className="text-base font-semibold text-white">Nenhum briefing encontrado</p>
            <p className="mt-2 text-sm text-zinc-500">Ajuste os filtros ou aguarde novos envios.</p>
          </div>
        )}
      </div>

      {selected ? (
        <BriefingDetailsDialog briefing={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function IconButton({ children, label, danger, onClick }: { children: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-300 transition hover:bg-white/5',
        danger && 'hover:bg-red-500/10 hover:text-red-200',
      )}
    >
      {children}
    </button>
  );
}
