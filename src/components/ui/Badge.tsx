import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

import { Flame } from 'lucide-react';

type BadgeVariant = 'sale' | 'new' | 'hot' | 'sold-out' | 'free-ship' | 'amber' | 'success' | 'error' | 'muted' | 'info';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  sale: 'bg-cafe-yellow-500 text-cafe-dark-900 ring-cafe-yellow-500/50',
  new: 'bg-emerald-900/30 text-emerald-400 ring-emerald-400/30',
  hot: 'bg-cafe-red-500 text-white ring-cafe-red-500/40',
  'sold-out': 'bg-cafe-dark-600 text-cafe-gray-400 ring-cafe-dark-600',
  'free-ship': 'bg-cafe-orange-500 text-white ring-cafe-orange-500/40',
  amber: 'badge-amber',
  success: 'bg-status-success/10 text-status-success ring-status-success/20',
  error: 'bg-status-error/10 text-status-error ring-status-error/20',
  muted: 'bg-white/5 text-text-secondary ring-white/10',
  info: 'bg-status-info/10 text-status-info ring-status-info/20',
};

export function Badge({ className, variant = 'amber', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-badge px-3 py-1 text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
