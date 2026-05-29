'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Loader2, RefreshCcw } from 'lucide-react';
import { TimerBar } from './TimerBar';
import type { PaymentPayload } from './types';

type PixResponse = {
  qr_code: string;
  qr_code_base64: string;
  id: string;
  expiracao: string;
};

type Props = {
  payload: PaymentPayload;
  onSuccess: () => void;
  onToast: (message: string, type?: 'success' | 'error') => void;
};

const totalSeconds = 30 * 60;

export function PixPayment({ payload, onSuccess, onToast }: Props) {
  const [pix, setPix] = useState<PixResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);
  const [remaining, setRemaining] = useState(totalSeconds);

  const generatePix = useCallback(async () => {
    setLoading(true);
    setExpired(false);
    setRemaining(totalSeconds);

    try {
      const response = await fetch('/api/pagamento/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: payload.amount,
          descricao: payload.description,
          email: payload.briefing.email,
          briefingId: payload.briefing.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Nao foi possivel gerar o Pix.');
      }

      setPix(data);
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Erro ao gerar Pix.', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast, payload]);

  useEffect(() => {
    generatePix();
  }, [generatePix]);

  useEffect(() => {
    if (!pix || expired) return;

    const interval = window.setInterval(() => {
      const seconds = Math.max(0, Math.floor((new Date(pix.expiracao).getTime() - Date.now()) / 1000));
      setRemaining(seconds);

      if (seconds <= 0) {
        setExpired(true);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [expired, pix]);

  useEffect(() => {
    if (!pix || expired) return;

    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/pagamento/status/${pix.id}`);
      const data = await response.json();

      if (data.status === 'approved') {
        onSuccess();
      }

      if (data.status === 'expired') {
        setExpired(true);
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [expired, onSuccess, pix]);

  const timeLabel = useMemo(() => {
    const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
    const seconds = String(remaining % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [remaining]);

  async function copyCode() {
    if (!pix?.qr_code) return;
    await navigator.clipboard.writeText(pix.qr_code);
    onToast('Codigo Pix copiado.', 'success');
  }

  if (loading && !pix) {
    return (
      <div className="grid min-h-64 place-items-center rounded-xl bg-zinc-800/50">
        <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
        Aprovação instantânea • sem taxas
      </div>

      <AnimatePresence mode="wait">
        {pix ? (
          <motion.div
            key={pix.id}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex justify-center rounded-xl bg-zinc-800 p-4">
              <img
                src={`data:image/png;base64,${pix.qr_code_base64}`}
                alt="QR Code Pix"
                className="h-48 w-48 rounded-lg bg-white p-2"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                <span>Expira em {timeLabel}</span>
                <span>{Math.round((remaining / totalSeconds) * 100)}%</span>
              </div>
              <TimerBar progress={remaining / totalSeconds} />
            </div>

            <div className="rounded-xl border border-zinc-700 bg-zinc-950/50 p-3">
              <p className="line-clamp-3 break-all text-xs leading-relaxed text-zinc-400">{pix.qr_code}</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                <Copy className="h-4 w-4" />
                Copiar código
              </button>
              {expired ? (
                <button
                  type="button"
                  onClick={generatePix}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Gerar novo QR Code
                </button>
              ) : null}
            </div>

            {expired ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                Este QR Code expirou. Gere um novo codigo para concluir o pagamento.
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
