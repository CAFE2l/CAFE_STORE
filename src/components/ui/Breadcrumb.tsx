import Link from 'next/link';
import { cn } from '@/lib/utils';

type BreadcrumbItem = {
  href?: string;
  label: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ className, items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-text-secondary', className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <span className="text-text-muted">/</span> : null}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition hover:text-text-primary">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast ? 'text-text-primary' : undefined)} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
