import { OrderStatus } from '@prisma/client';
import { Badge } from '@/components/ui/Badge';

type StatusBadgeProps = {
  status: OrderStatus;
};

const labels: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'DELIVERED') {
    return <Badge variant="success">{labels[status]}</Badge>;
  }

  if (status === 'CANCELLED') {
    return <Badge variant="error">{labels[status]}</Badge>;
  }

  if (status === 'SHIPPED') {
    return <Badge variant="info">{labels[status]}</Badge>;
  }

  return <Badge variant="amber">{labels[status]}</Badge>;
}
