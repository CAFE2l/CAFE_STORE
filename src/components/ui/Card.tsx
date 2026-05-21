import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('card p-5', className)} {...props} />;
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
