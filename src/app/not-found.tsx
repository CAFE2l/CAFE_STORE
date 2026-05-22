import Link from 'next/link';
import { Flame } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cafe-dark-900 px-4 text-center">
      <Flame className="h-16 w-16 text-cafe-orange-500 mb-6" />
      <h1 className="font-display text-7xl font-bold text-gradient-fire">404</h1>
      <p className="mt-4 text-lg text-text-secondary">Página não encontrada</p>
      <p className="mt-2 text-sm text-text-muted">O café que você procurava não está aqui.</p>
      <Link href="/" className="btn-primary mt-8">
        Voltar para o início
      </Link>
    </main>
  );
}
