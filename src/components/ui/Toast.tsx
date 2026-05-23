'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type ToastProps = {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const id = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(id);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border px-6 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl transition-all duration-300',
        type === 'success'
          ? 'border-green-500/30 bg-green-900/70 text-green-300'
          : 'border-red-500/30 bg-red-900/70 text-red-300',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
      role="alert"
    >
      <span className="mr-2">{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  );
}
