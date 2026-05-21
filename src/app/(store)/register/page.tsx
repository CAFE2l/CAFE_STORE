import type { Metadata } from 'next';
import { RegisterForm } from '@/components/store/RegisterForm';

export const metadata: Metadata = {
  title: 'Criar conta | Cafe Store',
  description: 'Crie sua conta Cafe Store.',
};

export default function RegisterPage() {
  return (
    <main className="container-page py-16">
      <RegisterForm />
    </main>
  );
}
