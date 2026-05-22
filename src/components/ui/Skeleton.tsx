import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'text' | 'card' | 'image' | 'circle';
};

export function Skeleton({ className, variant = 'text', ...props }: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    card: 'aspect-[4/3] w-full rounded-card',
    image: 'aspect-square w-full rounded-card',
    circle: 'h-12 w-12 rounded-full',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-cafe-dark-700 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-cafe-dark-600/60 before:to-transparent',
        variantStyles[variant],
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton variant="text" className={cn(className)} {...props} />;
}

export function SkeletonImage({ className, ...props }: SkeletonProps) {
  return <Skeleton variant="image" className={cn(className)} {...props} />;
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('card grid gap-4 p-4', className)} {...props}>
      <Skeleton variant="card" />
      <SkeletonText className="w-3/4" />
      <SkeletonText className="w-1/2" />
    </div>
  );
}
