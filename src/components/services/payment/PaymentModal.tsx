'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { MethodSelector } from './MethodSelector';
import { MercadoPagoPayment } from './MercadoPagoPayment';
import { PaymentToast } from './PaymentToast';
import { PaypalPayment } from './PaypalPayment';
import { PixPayment } from './PixPayment';
import { SuccessOverlay } from './SuccessOverlay';
import type { PaymentMethod, PaymentPayload, ToastState } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  payload: PaymentPayload;
};

export function PaymentModal({ open, onClose, payload }: Props) {
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [toast, setToast] = useState<ToastState>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function notify(message: string, type: 'success' | 'error' = 'error') {
    setToast({ message, type });
  }

  function handleSuccess() {
    setSuccess(true);
    notify('Pagamento confirmado.', 'success');
    window.setTimeout(() => {
      window.open(payload.whatsappUrl, '_blank', 'noopener,noreferrer');
    }, 450);
  }

  function openWhatsApp() {
    window.open(payload.whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <PaymentToast toast={toast} />
      <AnimatePresence>
        {open ? (
          <motion.div className="fixed inset-0 z-50 grid place-items-center px-4">
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Escolha como pagar"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-700/60 bg-zinc-900 p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                aria-label="Fechar modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pr-9">
                <h2 className="text-xl font-bold text-white">Escolha como pagar</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {payload.description} • {payload.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              <div className="mt-5">
                <MethodSelector selected={method} onChange={setMethod} />
              </div>

              <div className="my-5 h-px bg-zinc-800" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={method}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {method === 'pix' ? (
                    <PixPayment payload={payload} onSuccess={handleSuccess} onToast={notify} />
                  ) : null}
                  {method === 'mercadopago' ? (
                    <MercadoPagoPayment payload={payload} onSuccess={handleSuccess} onToast={notify} />
                  ) : null}
                  {method === 'paypal' ? (
                    <PaypalPayment payload={payload} onSuccess={handleSuccess} onToast={notify} />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>{success ? <SuccessOverlay onWhatsApp={openWhatsApp} /> : null}</AnimatePresence>
    </>
  );
}
