import type { Metadata } from 'next';
import { CouponsPageClient } from '@/components/account/ProfileSectionPages';

export const metadata: Metadata = {
  title: 'Cupons | Cafe Store',
};

export default function PerfilCuponsPage() {
  return <CouponsPageClient />;
}
