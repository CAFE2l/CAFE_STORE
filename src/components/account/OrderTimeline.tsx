import { OrderStatus } from '@prisma/client';
import { cn } from '@/lib/utils';

type OrderTimelineProps = {
  status: OrderStatus;
};

const steps: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Pedido criado' },
  { status: 'SCHEDULED', label: 'Agendado' },
  { status: 'PROCESSING', label: 'Pagamento/processamento' },
  { status: 'SHIPPED', label: 'Pedido enviado' },
  { status: 'DELIVERED', label: 'Entregue' },
];

function getStepIndex(status: OrderStatus) {
  if (status === 'CANCELLED') {
    return -1;
  }

  return steps.findIndex((step) => step.status === status);
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const currentIndex = getStepIndex(status);

  if (status === 'CANCELLED') {
    return (
      <div className="rounded-2xl border border-status-error/30 bg-status-error/10 p-4 text-sm text-status-error">
        Pedido cancelado.
      </div>
    );
  }

  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.status} className="grid gap-2">
          <span
            className={cn(
              'h-2 rounded-full',
              index <= currentIndex ? 'bg-accent-primary shadow-[0_0_18px_rgba(200,135,58,0.35)]' : 'bg-white/10',
            )}
          />
          <span className={cn('text-sm', index <= currentIndex ? 'text-text-primary' : 'text-text-muted')}>
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
