import type { Metadata } from 'next';
import { AddressesPageClient } from '@/components/account/ProfileSectionPages';

export const metadata: Metadata = {
  title: 'Endereços | Cafe Store',
};

export default function PerfilEnderecosPage() {
  return <AddressesPageClient />;
}
