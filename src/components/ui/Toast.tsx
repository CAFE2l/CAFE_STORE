'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

type ToastProps = {
  open: boolean;
  title: string;
  message?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
};

const variants: Record<ToastVariant, string> = {
  success: 'border-status-success/40 text-status-success',
  error: 'border-status-error/40 text-status-error',
  info: 'border-status-info/40 text-status-info',
};

export function Toast({
  duration = 4000,
  message,
  onClose,
  open,
  title,
  variant = 'info',
}: ToastProps) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const timeout = window.setTimeout(onClose, duration);

    return () => window.clearTimeout(timeout);
  }, [duration, onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'glass fixed right-4 top-4 z-50 w-[min(calc(100vw-2rem),24rem)] rounded-2xl border p-4 shadow-warm animate-slideInRight',
        variants[variant],
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-text-primary">{title}</p>
          {message ? <p className="mt-1 text-sm leading-6 text-text-secondary">{message}</p> : null}
        </div>
        <button type="button" className="btn-ghost size-8 p-0" aria-label="Fechar aviso" onClick={onClose}>
          X
        </button>
      </div>
    </div>
  );
}
