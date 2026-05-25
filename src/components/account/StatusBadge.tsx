import type { OrderStatus } from '@prisma/client';
import { cn } from '@/lib/utils';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Aguardando pagamento', className: 'bg-cafe-yellow-500/15 text-cafe-yellow-500 ring-cafe-yellow-500/30' },
  SCHEDULED: { label: 'Agendado', className: 'bg-purple-500/15 text-purple-300 ring-purple-400/30' },
  PROCESSING: { label: 'Em separação', className: 'bg-blue-500/15 text-blue-400 ring-blue-400/30' },
  SHIPPED: { label: 'Enviado', className: 'bg-cafe-orange-500/15 text-cafe-orange-500 ring-cafe-orange-500/30' },
  DELIVERED: { label: 'Entregue', className: 'bg-status-success/15 text-status-success ring-status-success/30' },
  CANCELLED: { label: 'Cancelado', className: 'bg-cafe-red-500/15 text-cafe-red-500 ring-cafe-red-500/30' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex rounded-badge px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', config.className)}>
      {config.label}
    </span>
  );
}
