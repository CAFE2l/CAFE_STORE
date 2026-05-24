import type { Metadata } from 'next';
import { SecurityPageClient } from '@/components/account/ProfileSectionPages';

export const metadata: Metadata = {
  title: 'Segurança | Cafe Store',
};

export default function PerfilSegurancaPage() {
  return <SecurityPageClient />;
}
