import type { Metadata } from 'next';
import { SecurityPageClient } from '@/components/account/SecurityPageClient';

export const metadata: Metadata = {
  title: 'Segurança | Cafe Store',
};

export default function PerfilSegurancaPage() {
  return <SecurityPageClient />;
}
