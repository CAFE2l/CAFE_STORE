import { cn } from '@/lib/utils';

const variants = {
  ACTIVE: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  INACTIVE: 'border-white/10 bg-white/5 text-zinc-300',
  OUT_OF_STOCK: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  PENDING: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  SCHEDULED: 'border-purple-400/20 bg-purple-400/10 text-purple-300',
  PROCESSING: 'border-orange-400/20 bg-orange-400/10 text-orange-300',
  SHIPPED: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
  DELIVERED: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  CANCELLED: 'border-red-400/20 bg-red-400/10 text-red-300',
  ADMIN: 'border-orange-400/20 bg-orange-400/10 text-orange-300',
  CUSTOMER: 'border-white/10 bg-white/5 text-zinc-300',
  success: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  muted: 'border-white/10 bg-white/5 text-zinc-300',
  danger: 'border-red-400/20 bg-red-400/10 text-red-300',
};

type AdminBadgeProps = {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
};

export function AdminBadge({ children, variant = 'muted', className }: AdminBadgeProps) {
  return (
    <span className={cn('inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
