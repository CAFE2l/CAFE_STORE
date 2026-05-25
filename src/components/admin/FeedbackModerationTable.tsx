'use client';

import Image from 'next/image';
import { useState, useTransition } from 'react';
import type { FeedbackPriority, FeedbackSource, FeedbackStatus } from '@prisma/client';
import { Archive, Check, Eye, Mail, MessageSquareReply, Search, Trash2, X } from 'lucide-react';
import { deleteFeedbackAction, updateFeedbackPriorityAction, updateFeedbackStatusAction } from '@/lib/admin/actions';
import { dateTime, toMoney } from '@/lib/admin/formatters';
import { cn } from '@/lib/utils';

type FeedbackItem = {
  id: string;
  authorName: string;
  authorEmail: string;
  authorAvatarUrl: string | null;
  phone: string | null;
  title: string;
  body: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  source: FeedbackSource;
  rating: number;
  createdAt: Date;
  user: { name: string | null; email: string; phone: string | null; image: string | null } | null;
  product: { id: string; name: string; slug: string } | null;
  order: { id: string; status: string; total: number } | null;
};

const statusLabel: Record<FeedbackStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  ARCHIVED: 'Arquivado',
};

const priorityLabel: Record<FeedbackPriority, string> = {
  LOW: 'Baixa',
  NORMAL: 'Normal',
  HIGH: 'Alta',
};

const statusClasses: Record<FeedbackStatus, string> = {
  PENDING: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  APPROVED: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  REJECTED: 'border-red-400/20 bg-red-400/10 text-red-200',
  ARCHIVED: 'border-zinc-600 bg-zinc-900 text-zinc-300',
};

const priorityClasses: Record<FeedbackPriority, string> = {
  LOW: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  NORMAL: 'border-white/10 bg-white/5 text-zinc-300',
  HIGH: 'border-red-400/20 bg-red-400/10 text-red-200',
};

type Props = {
  feedbacks: FeedbackItem[];
  filters: { q: string; status: string; priority: string };
};

export function FeedbackModerationTable({ feedbacks, filters }: Props) {
  const [selected, setSelected] = useState<FeedbackItem | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  }

  function changeStatus(feedback: FeedbackItem, status: FeedbackStatus) {
    startTransition(async () => {
      const result = await updateFeedbackStatusAction(feedback.id, status);
      showToast(result.ok ? 'success' : 'error', result.message);
      if (selected?.id === feedback.id) setSelected({ ...feedback, status });
    });
  }

  function changePriority(feedback: FeedbackItem, priority: FeedbackPriority) {
    startTransition(async () => {
      const result = await updateFeedbackPriorityAction(feedback.id, priority);
      showToast(result.ok ? 'success' : 'error', result.message);
      if (selected?.id === feedback.id) setSelected({ ...feedback, priority });
    });
  }

  function remove(feedback: FeedbackItem) {
    if (!confirm(`Excluir feedback de ${feedback.authorName}?`)) return;
    startTransition(async () => {
      const result = await deleteFeedbackAction(feedback.id);
      showToast(result.ok ? 'success' : 'error', result.message);
      if (selected?.id === feedback.id) setSelected(null);
    });
  }

  return (
    <div className="grid gap-5">
      {toast ? (
        <div className={cn('fixed right-5 top-20 z-[90] rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur', toast.type === 'success' ? 'border-emerald-400/20 bg-emerald-500/15 text-emerald-100' : 'border-red-400/20 bg-red-500/15 text-red-100')}>
          {toast.message}
        </div>
      ) : null}

      <form className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/25 p-3 backdrop-blur md:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input name="q" defaultValue={filters.q} placeholder="Buscar por nome, email, título ou mensagem" className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-white outline-none transition focus:border-orange-400/60" />
        </label>
        <select name="status" defaultValue={filters.status} className="h-11 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-orange-400/60">
          <option value="all">Todos os status</option>
          <option value="PENDING">Pendentes</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Rejeitados</option>
          <option value="ARCHIVED">Arquivados</option>
        </select>
        <select name="priority" defaultValue={filters.priority} className="h-11 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-orange-400/60">
          <option value="all">Todas prioridades</option>
          <option value="LOW">Baixa</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">Alta</option>
        </select>
        <button className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white shadow-led-brand transition hover:bg-orange-400">Filtrar</button>
      </form>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25 shadow-card backdrop-blur">
        {feedbacks.length ? (
          <div className="divide-y divide-white/10">
            {feedbacks.map((feedback) => {
              const name = feedback.user?.name ?? feedback.authorName;
              const email = feedback.user?.email ?? feedback.authorEmail;
              const phone = feedback.user?.phone ?? feedback.phone;
              const avatar = feedback.user?.image ?? feedback.authorAvatarUrl;

              return (
                <article key={feedback.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[1.1fr_1.5fr_auto] xl:items-start">
                  <div className="flex gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                      {avatar ? (
                        <Image src={avatar} alt={name} fill sizes="44px" className="object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-sm font-bold text-orange-200">{name.slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{name}</p>
                      <p className="truncate text-xs text-zinc-500">{email}</p>
                      <p className="text-xs text-zinc-600">{phone || 'Sem telefone'} • {dateTime.format(feedback.createdAt)}</p>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-white">{feedback.title}</h2>
                      <Badge className={statusClasses[feedback.status]}>{statusLabel[feedback.status]}</Badge>
                      <Badge className={priorityClasses[feedback.priority]}>{priorityLabel[feedback.priority]}</Badge>
                      <Badge className="border-white/10 bg-white/5 text-zinc-300">{feedback.source}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">{feedback.body}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500">
                      {feedback.product ? <span>Produto: {feedback.product.name}</span> : null}
                      {feedback.order ? <span>Pedido: #{feedback.order.id.slice(0, 8)} • {toMoney(feedback.order.total)}</span> : null}
                      <span>Rating: {feedback.rating}/5</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <IconButton label="Aprovar" onClick={() => changeStatus(feedback, 'APPROVED')}><Check className="h-4 w-4" /></IconButton>
                    <IconButton label="Rejeitar" onClick={() => changeStatus(feedback, 'REJECTED')}><X className="h-4 w-4" /></IconButton>
                    <IconButton label="Arquivar" onClick={() => changeStatus(feedback, 'ARCHIVED')}><Archive className="h-4 w-4" /></IconButton>
                    <IconButton label="Detalhes" onClick={() => setSelected(feedback)}><Eye className="h-4 w-4" /></IconButton>
                    <IconButton label="Excluir" onClick={() => remove(feedback)} danger><Trash2 className="h-4 w-4" /></IconButton>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid place-items-center px-6 py-16 text-center">
            <Mail className="mb-4 h-8 w-8 text-zinc-700" />
            <h2 className="font-bold text-white">Nenhum feedback encontrado</h2>
            <p className="mt-2 text-sm text-zinc-500">Ajuste os filtros ou aguarde novas mensagens.</p>
          </div>
        )}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selected.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{selected.authorName} • {selected.authorEmail}</p>
              </div>
              <button onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 hover:text-white" aria-label="Fechar"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-5 p-5">
              <div className="flex flex-wrap gap-2">
                <Badge className={statusClasses[selected.status]}>{statusLabel[selected.status]}</Badge>
                <Badge className={priorityClasses[selected.priority]}>{priorityLabel[selected.priority]}</Badge>
                <Badge className="border-white/10 bg-white/5 text-zinc-300">{selected.source}</Badge>
              </div>
              <p className="whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-300">{selected.body}</p>
              <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400 sm:grid-cols-2">
                <span>Telefone: {selected.user?.phone ?? selected.phone ?? 'Não informado'}</span>
                <span>Data: {dateTime.format(selected.createdAt)}</span>
                <span>Produto: {selected.product?.name ?? 'Não vinculado'}</span>
                <span>Pedido: {selected.order ? `#${selected.order.id.slice(0, 8)}` : 'Não vinculado'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button disabled={pending} onClick={() => changeStatus(selected, 'APPROVED')} className="h-10 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-white">Aprovar</button>
                <button disabled={pending} onClick={() => changeStatus(selected, 'REJECTED')} className="h-10 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white">Rejeitar</button>
                <button disabled={pending} onClick={() => changeStatus(selected, 'ARCHIVED')} className="h-10 rounded-lg border border-white/10 px-4 text-sm font-semibold text-zinc-200">Arquivar</button>
                <select defaultValue={selected.priority} onChange={(event) => changePriority(selected, event.target.value as FeedbackPriority)} className="h-10 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white">
                  <option value="LOW">Prioridade baixa</option>
                  <option value="NORMAL">Prioridade normal</option>
                  <option value="HIGH">Prioridade alta</option>
                </select>
                <a href={`mailto:${selected.authorEmail}?subject=Re: ${selected.title}`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-orange-400/30 bg-orange-500/10 px-4 text-sm font-semibold text-orange-100">
                  <MessageSquareReply className="h-4 w-4" />
                  Responder
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return <span className={cn('inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold', className)}>{children}</span>;
}

function IconButton({ children, label, danger, onClick }: { children: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn('grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-300 transition hover:bg-white/5', danger && 'hover:bg-red-500/10 hover:text-red-200')}
    >
      {children}
    </button>
  );
}
