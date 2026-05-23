import type { Metadata } from 'next';
import { RegisterForm } from '@/components/store/RegisterForm';

export const metadata: Metadata = {
  title: 'Criar conta | CAFÉ STORE',
  description: 'Crie sua conta e tenha uma experiência de compra mais rápida, segura e personalizada.',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-surface-base">
      <RegisterForm />
    </main>
  );
}
