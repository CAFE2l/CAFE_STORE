'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Package, Trash2, X } from 'lucide-react'
import { OrderStatus } from '@prisma/client'

export default function OrderActionsClient({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const current = status as OrderStatus

  const canCancel = !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(current)
  const isCancelled = current === 'CANCELLED'
  const isDelivered = current === 'DELIVERED'
  const isShipped = current === 'SHIPPED'

  async function handleCancel() {
    if (!confirm('Deseja cancelar este pedido? O suporte sera notificado.')) return
    setLoading(true)
    const res = await fetch(`/api/user/orders/${orderId}`, { method: 'PATCH' }).catch(() => null)
    setLoading(false)
    if (res?.ok) router.refresh()
    else alert('Falha ao cancelar pedido.')
  }

  async function handleDelete() {
    if (!confirm('Deseja excluir este pedido permanentemente do historico?')) return
    setLoading(true)
    const res = await fetch(`/api/user/orders/${orderId}`, { method: 'DELETE' }).catch(() => null)
    setLoading(false)
    if (res?.ok) router.push('/orders')
    else alert('Falha ao excluir pedido.')
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canCancel ? (
        <button className="inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/10 px-3 py-2 text-xs font-semibold text-brand transition hover:border-brand hover:bg-brand/15" onClick={handleCancel} disabled={loading}>
          <X className="size-3.5" />
          Cancelar pedido
        </button>
      ) : null}
      {isCancelled ? (
        <button className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10" onClick={handleDelete} disabled={loading}>
          <Trash2 className="size-3.5" />
          Excluir pedido
        </button>
      ) : null}
      {isDelivered ? (
        <span
          className="inline-flex items-center gap-2 rounded-lg border border-green-500/25 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400"
          title="Este pedido foi concluido e mantido no historico por seguranca."
        >
          <Check className="size-3.5" />
          Historico finalizado
        </span>
      ) : null}
      {isShipped ? (
        <span
          className="inline-flex items-center gap-2 rounded-lg border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-400"
          title="Nao e possivel cancelar um pedido que ja foi despachado."
        >
          <Package className="size-3.5" />
          Em transito
        </span>
      ) : null}
    </div>
  )
}
