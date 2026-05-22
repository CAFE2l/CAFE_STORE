import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'featured';
};

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'card p-5',
        variant === 'featured' ? 'relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-cafe-red-500 before:via-cafe-orange-500 before:to-cafe-yellow-500' : undefined,
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('mb-4 grid gap-1', className)} {...props} />;
}

export function CardTitle({ className, ...props }: CardProps) {
  return <h2 className={cn('text-lg font-semibold text-text-primary', className)} {...props} />;
}

export function CardDescription({ className, ...props }: CardProps) {
  return <p className={cn('text-sm leading-6 text-text-secondary', className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('grid gap-4', className)} {...props} />;
}
