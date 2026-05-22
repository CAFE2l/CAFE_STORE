import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Redefinir senha | Cafe Store',
  description: 'Crie uma nova senha para sua conta Cafe Store.',
};

export default function ResetPasswordPage() {
  return (
    <main className="container-page py-16">
      <ResetPasswordForm />
    </main>
  );
}
