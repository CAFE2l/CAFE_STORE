'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ToastState } from './types';

type Props = {
  toast: ToastState;
};

export function PaymentToast({ toast }: Props) {
  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            x: toast.type === 'error' ? [0, -8, 8, -5, 5, 0] : 0,
          }}
          exit={{ y: -24, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          className={`fixed left-1/2 top-5 z-[70] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-2xl ${
            toast.type === 'error'
              ? 'border-red-500/40 bg-red-950/90 text-red-100'
              : 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {toast.message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
