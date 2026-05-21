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
