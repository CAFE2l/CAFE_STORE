import type { Metadata } from 'next';
import { LoginForm } from '@/components/store/LoginForm';

export const metadata: Metadata = {
  title: 'Entrar | Cafe Store',
  description: 'Acesse sua conta Cafe Store.',
};

export default function LoginPage() {
  return (
    <main className="container-page py-16">
      <LoginForm />
    </main>
  );
}
