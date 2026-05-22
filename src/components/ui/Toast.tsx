'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type ToastProps = {
  open: boolean;
  title: string;
  message?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
};

const iconMap: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-status-success" />,
  error: <XCircle className="h-5 w-5 text-status-error" />,
  warning: <AlertTriangle className="h-5 w-5 text-cafe-yellow-500" />,
  info: <AlertTriangle className="h-5 w-5 text-cafe-orange-500" />,
};

const variants: Record<ToastVariant, string> = {
  success: 'border-status-success/30',
  error: 'border-status-error/30',
  warning: 'border-cafe-yellow-500/30',
  info: 'border-cafe-orange-500/30',
};

export function Toast({
  duration = 3000,
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
        'glass fixed bottom-4 right-4 z-50 w-[min(calc(100vw-2rem),24rem)] rounded-card border p-4 shadow-warm animate-slideInRight',
        variants[variant],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0">{iconMap[variant]}</span>
          <div>
            <p className="font-semibold text-text-primary">{title}</p>
            {message ? <p className="mt-1 text-sm leading-6 text-text-secondary">{message}</p> : null}
          </div>
        </div>
        <button
          type="button"
          className="grid size-7 shrink-0 place-items-center rounded-full text-text-muted transition hover:bg-white/10 hover:text-text-primary"
          aria-label="Fechar aviso"
          onClick={onClose}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
