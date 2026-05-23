import type { Metadata } from 'next';
import { LoginForm } from '@/components/store/LoginForm';

export const metadata: Metadata = {
  title: 'Entrar | CAFÉ STORE',
  description: 'Acompanhe seus pedidos, favoritos e finalize compras mais rápido.',
};

export default function LoginPage() {
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <main className="min-h-screen bg-surface-base">
      <LoginForm googleEnabled={googleEnabled} />
    </main>
  );
}
