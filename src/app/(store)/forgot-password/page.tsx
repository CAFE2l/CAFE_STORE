import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Esqueci minha senha | Cafe Store',
  description: 'Solicite um link seguro para redefinir sua senha da Cafe Store.',
};

export default function ForgotPasswordPage() {
  return (
    <main className="container-page py-16">
      <ForgotPasswordForm />
    </main>
  );
}
