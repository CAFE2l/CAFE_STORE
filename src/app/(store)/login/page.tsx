import type { Metadata } from 'next';
import { LoginForm } from '@/components/store/LoginForm';

export const metadata: Metadata = {
  title: 'Entrar | Cafe Store',
  description: 'Acesse sua conta Cafe Store.',
};

export default function LoginPage() {
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <main className="container-page py-16">
      <LoginForm googleEnabled={googleEnabled} />
    </main>
  );
}
