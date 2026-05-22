import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: {
    href: string;
    label: string;
  };
  className?: string;
};

export function EmptyState({ action, className, icon, subtitle, title }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-card px-6 py-16 text-center',
        className,
      )}
    >
      <div className="mb-6 grid size-20 place-items-center rounded-full bg-cafe-orange-500/10">
        {icon ?? <ShoppingBag className="h-8 w-8 text-cafe-orange-500" />}
      </div>
      <h2 className="font-display text-2xl font-semibold text-text-primary">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">{subtitle}</p> : null}
      {action ? (
        <Link href={action.href} className="btn-primary mt-6">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
