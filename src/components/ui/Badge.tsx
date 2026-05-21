import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'amber' | 'success' | 'error' | 'muted' | 'info';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
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
        'inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
