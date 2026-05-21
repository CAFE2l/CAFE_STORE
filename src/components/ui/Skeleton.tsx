import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-white/[0.06] before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} {...props} />;
}

export function SkeletonImage({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn('aspect-square w-full', className)} {...props} />;
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn('card grid gap-4 p-4', className)} {...props}>
      <SkeletonImage />
      <SkeletonText className="w-3/4" />
      <SkeletonText className="w-1/2" />
    </div>
  );
}
