import type { Metadata } from 'next';
import { FavoritesPageClient } from '@/components/account/FavoritesPageClient';

export const metadata: Metadata = {
  title: 'Favoritos | Cafe Store',
};

export default function PerfilFavoritosPage() {
  return <FavoritesPageClient />;
}
