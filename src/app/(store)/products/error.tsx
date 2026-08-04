'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    logger.error('products/error', 'Failed to render product page', {
      route: window.location.pathname,
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-base px-4 py-20 text-center">
      <div className="max-w-md rounded-2xl border border-zinc-800 bg-surface-2/50 p-8">
        <h1 className="text-xl font-bold text-white">Não foi possível carregar este produto</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Ocorreu um erro ao buscar os dados deste produto. Tente novamente.
        </p>
        <button
          type="button"
          className="mt-6 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          onClick={reset}
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
