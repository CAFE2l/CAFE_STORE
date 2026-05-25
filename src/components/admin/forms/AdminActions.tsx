'use client';

import { OrderStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useState } from 'react';

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function updateStatus(event: ChangeEvent<HTMLSelectElement>) {
    setSaving(true);
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: event.target.value }),
    });
    setSaving(false);
    if (response.ok) router.refresh();
  }

  return (
    <select
      className="h-10 min-w-40 rounded-lg border border-white/10 bg-zinc-950 px-3 text-xs font-semibold text-zinc-200 outline-none transition focus:border-orange-400/60 disabled:cursor-wait disabled:opacity-60"
      defaultValue={status}
      onChange={updateStatus}
      disabled={saving}
      aria-label="Alterar status do pedido"
    >
      <option value="PENDING">Aguardando pagamento</option>
      <option value="SCHEDULED">Agendado</option>
      <option value="PROCESSING">Em separação</option>
      <option value="SHIPPED">Enviado</option>
      <option value="DELIVERED">Entregue</option>
      <option value="CANCELLED">Cancelado</option>
    </select>
  );
}

export function ReviewModerationButtons({ reviewId }: { reviewId: string }) {
  const router = useRouter();

  async function moderate(approved: boolean) {
    await fetch(`/api/admin/reviews/${reviewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button type="button" className="btn-primary px-3 py-2 text-xs" onClick={() => moderate(true)}>Aprovar</button>
      <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={() => moderate(false)}>Rejeitar</button>
    </div>
  );
}

export function FeedbackModerationButtons({
  feedbackId,
  isApproved,
  isVerified,
  isFeatured,
}: {
  feedbackId: string;
  isApproved: boolean;
  isVerified: boolean;
  isFeatured: boolean;
}) {
  const router = useRouter();

  async function update(body: Record<string, boolean>) {
    await fetch(`/api/admin/feedbacks/${feedbackId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    router.refresh();
  }

  async function remove() {
    if (!confirm('Remover este feedback?')) return;
    await fetch(`/api/admin/feedbacks/${feedbackId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn-primary px-3 py-2 text-xs" onClick={() => update({ isApproved: !isApproved })}>
        {isApproved ? 'Desaprovar' : 'Aprovar'}
      </button>
      <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={() => update({ isVerified: !isVerified })}>
        {isVerified ? 'Remover verificado' : 'Verificar'}
      </button>
      <button type="button" className="btn-secondary px-3 py-2 text-xs" onClick={() => update({ isFeatured: !isFeatured })}>
        {isFeatured ? 'Remover destaque' : 'Destacar'}
      </button>
      <button type="button" className="rounded-button border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10" onClick={remove}>
        Rejeitar
      </button>
    </div>
  );
}

// NEW: toggle for "Na página de serviços"
export function FeaturedServicesToggle({ id, isFeaturedServices, order } : { id: string; isFeaturedServices: boolean; order: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(v: boolean) {
    setLoading(true);
    await fetch(`/api/admin/feedbacks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeaturedServices: v }),
    }).catch(() => null);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggle(!isFeaturedServices)}
        disabled={loading}
        className={`relative w-10 h-5 rounded-full transition-all duration-300 border ${isFeaturedServices ? 'bg-brand border-brand shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-white/[0.06] border-white/10'}`}
        aria-label={isFeaturedServices ? 'Remover da página de serviços' : 'Destacar na página de serviços'}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${isFeaturedServices ? 'left-5' : 'left-0.5'}`} />
      </button>
      {isFeaturedServices && <span className="text-xs text-brand font-mono">#{order}</span>}
    </div>
  );
}
