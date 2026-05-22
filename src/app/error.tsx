'use client';

import { Flame } from 'lucide-react';

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function Error({ reset }: ErrorProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cafe-dark-900 px-4 text-center">
      <Flame className="h-16 w-16 text-cafe-red-500 mb-6" />
      <h1 className="font-display text-4xl font-bold text-text-primary">Algo deu errado</h1>
      <p className="mt-4 text-sm text-text-muted">Não foi possível carregar esta página. Tente novamente.</p>
      <button type="button" className="btn-primary mt-8" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
