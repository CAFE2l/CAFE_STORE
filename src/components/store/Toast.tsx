'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type ToastData = {
  id: string;
  message: string;
  action?: { label: string; onClick: () => void };
  type?: 'success' | 'error' | 'info';
};

let toastListeners: ((t: ToastData) => void)[] = [];

export function showToast(t: Omit<ToastData, 'id'>) {
  const id = Math.random().toString(36).slice(2);
  for (const fn of toastListeners) fn({ ...t, id });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler = (t: ToastData) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3500);
    };
    toastListeners.push(handler);
    return () => { toastListeners = toastListeners.filter((fn) => fn !== handler); };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-24 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'animate-slide-up flex items-center gap-3 rounded-xl border bg-surface-1 px-5 py-3 pr-4 shadow-2xl backdrop-blur-xl',
            t.type === 'error' ? 'border-red-500/30' : 'border-[#FF7A00]/30',
          )}
          style={{ borderLeftWidth: '3px', borderLeftColor: t.type === 'error' ? '#FF3C38' : '#FF7A00' }}
        >
          <span className="text-sm text-zinc-300">{t.message}</span>
          {t.action ? (
            <button
              type="button"
              className="whitespace-nowrap text-xs font-semibold text-[#FF7A00] transition hover:text-[#FF7A00]/80"
              onClick={() => { t.action?.onClick(); setToasts((prev) => prev.filter((x) => x.id !== t.id)); }}
            >
              {t.action.label}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
