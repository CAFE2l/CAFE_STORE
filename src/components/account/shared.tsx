'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function EmptyPanel({ title, subtitle, action }: { title: string; subtitle?: string; action?: { href?: string; label: string; onClick?: () => void } }) {
  const button = action?.href ? (
    <Link href={action.href} className="btn-primary mt-5 inline-flex">
      {action.label}
    </Link>
  ) : action ? (
    <Button className="mt-5" onClick={action.onClick}>{action.label}</Button>
  ) : null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-10 text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
        <Package className="size-7" />
      </div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {subtitle ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">{subtitle}</p> : null}
      {button}
    </div>
  );
}

export function SkeletonCards() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-4">
          <div className="flex gap-4">
            <div className="size-20 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-1/3 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-white/[0.06]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
