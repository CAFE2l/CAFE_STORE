'use client';

import { OrderStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { ChangeEvent } from 'react';

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();

  async function updateStatus(event: ChangeEvent<HTMLSelectElement>) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: event.target.value }),
    });
    router.refresh();
  }

  return (
    <select className="input-field" defaultValue={status} onChange={updateStatus}>
      <option value="PENDING">Pendente</option>
      <option value="PROCESSING">Processando</option>
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
