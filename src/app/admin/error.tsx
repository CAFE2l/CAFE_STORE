'use client';

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="max-w-md rounded-xl border border-red-400/20 bg-red-500/10 p-6 text-center">
        <h1 className="text-lg font-bold text-white">Não foi possível carregar o admin</h1>
        <p className="mt-2 text-sm text-red-100/70">Verifique a conexão com o banco e tente novamente.</p>
        <button onClick={reset} className="mt-5 h-10 rounded-lg bg-red-500 px-4 text-sm font-semibold text-white">Tentar de novo</button>
      </div>
    </div>
  );
}

