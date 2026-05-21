import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
        'glass grid place-items-center rounded-2xl px-6 py-12 text-center shadow-card',
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 grid size-14 place-items-center rounded-full bg-accent-primary/10 text-accent-primary">
          {icon}
        </div>
      ) : null}
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
