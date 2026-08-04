'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionVariant = 'neutral' | 'blue' | 'orange' | 'red' | 'green';

type BaseAction = {
  label: string;
  icon: React.ReactNode;
  variant?: ActionVariant;
  disabled?: boolean;
  hidden?: boolean;
};

type ButtonAction = BaseAction & {
  type: 'button';
  onClick: () => void;
  loading?: boolean;
};

type LinkAction = BaseAction & {
  type: 'link';
  href: string;
};

type DropdownAction = BaseAction & {
  type: 'dropdown-item';
  onClick: () => void;
  loading?: boolean;
};

export type Action = ButtonAction | LinkAction | DropdownAction;

type ActionGroupProps = {
  /** Primary actions shown as icon buttons */
  actions: Action[];
  /** Actions hidden inside the "More" dropdown */
  moreActions?: DropdownAction[];
  size?: 'sm' | 'md';
};

// ─── Variant styles ───────────────────────────────────────────────────────────

const variantBase: Record<ActionVariant, string> = {
  neutral: 'text-zinc-400 hover:text-white hover:bg-white/[0.08] hover:border-white/20',
  blue:    'text-blue-400/70 hover:text-blue-300 hover:bg-blue-500/10 hover:border-blue-500/30',
  orange:  'text-orange-400/70 hover:text-orange-300 hover:bg-orange-500/10 hover:border-orange-500/30',
  red:     'text-red-400/60 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30',
  green:   'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/30',
};

const dropdownVariant: Record<ActionVariant, string> = {
  neutral: 'text-zinc-300 hover:bg-white/[0.06] hover:text-white',
  blue:    'text-blue-300 hover:bg-blue-500/10',
  orange:  'text-orange-300 hover:bg-orange-500/10',
  red:     'text-red-300 hover:bg-red-500/10',
  green:   'text-emerald-300 hover:bg-emerald-500/10',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ActionBtn({
  action,
  size,
}: {
  action: ButtonAction | LinkAction;
  size: 'sm' | 'md';
}) {
  const variant = action.variant ?? 'neutral';
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const base = cn(
    'inline-flex shrink-0 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.04] transition-all duration-150 hover:scale-[1.03] hover:shadow-sm active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 disabled:pointer-events-none disabled:opacity-40',
    variantBase[variant],
    dim,
  );

  if (action.type === 'link') {
    return (
      <Link href={action.href} aria-label={action.label} title={action.label} className={base}>
        <span className="transition-transform duration-150 group-hover:scale-110">{action.icon}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={action.label}
      title={action.label}
      onClick={action.onClick}
      disabled={action.disabled || action.loading}
      className={base}
    >
      {action.loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <span className="transition-transform duration-150">{action.icon}</span>
      )}
    </button>
  );
}

function MoreDropdown({
  items,
  size,
}: {
  items: DropdownAction[];
  size: 'sm' | 'md';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const visible = items.filter((i) => !i.hidden);
  if (visible.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Mais ações"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-[10px] border border-white/[0.08] bg-white/[0.04] text-zinc-400 transition-all duration-150 hover:scale-[1.03] hover:border-white/20 hover:bg-white/[0.08] hover:text-white hover:shadow-sm active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40',
          dim,
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-white/[0.10] bg-zinc-950 py-1 shadow-2xl shadow-black/60 backdrop-blur-xl"
        >
          {visible.map((item, i) => (
            <button
              key={i}
              role="menuitem"
              type="button"
              disabled={item.disabled || item.loading}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={cn(
                'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40',
                dropdownVariant[item.variant ?? 'neutral'],
              )}
            >
              {item.loading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <span className="h-4 w-4 shrink-0">{item.icon}</span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ActionGroup({ actions, moreActions, size = 'md' }: ActionGroupProps) {
  const primary = actions.filter((a) => !a.hidden);

  return (
    <div className="flex items-center gap-1.5" role="group">
      {primary.map((action, i) =>
        action.type === 'dropdown-item' ? null : (
          <ActionBtn key={i} action={action} size={size} />
        ),
      )}
      {moreActions && moreActions.length > 0 && (
        <MoreDropdown items={moreActions} size={size} />
      )}
    </div>
  );
}
