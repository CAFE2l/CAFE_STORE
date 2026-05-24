'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { OrderStatus } from '@prisma/client'

export default function OrderActionsClient({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const canCancel = !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status as OrderStatus)
  const canDelete = !['SHIPPED', 'DELIVERED'].includes(status as OrderStatus)

  async function handleCancel() {
    if (!confirm('Deseja cancelar este pedido?')) return
    setLoading(true)
    const res = await fetch(`/api/user/orders/${orderId}`, { method: 'PATCH' }).catch(() => null)
    setLoading(false)
    if (res?.ok) router.refresh()
    else alert('Falha ao cancelar pedido.')
  }

  async function handleDelete() {
    if (!confirm('Deseja excluir este pedido permanentemente?')) return
    setLoading(true)
    const res = await fetch(`/api/user/orders/${orderId}`, { method: 'DELETE' }).catch(() => null)
    setLoading(false)
    if (res?.ok) router.push('/orders')
    else alert('Falha ao excluir pedido.')
  }

  return (
    <div className="flex items-center gap-2">
      {canCancel ? (
        <button className="btn-secondary px-3 py-2 text-xs" onClick={handleCancel} disabled={loading}>
          Cancelar pedido
        </button>
      ) : null}
      {canDelete ? (
        <button className="rounded-button border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10" onClick={handleDelete} disabled={loading}>
          Excluir pedido
        </button>
      ) : null}
    </div>
  )
}
