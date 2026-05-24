import type { Metadata } from 'next';
import { OrdersPageClient } from '@/components/account/ProfileSectionPages';

export const metadata: Metadata = {
  title: 'Meus Pedidos | Cafe Store',
};

export default function PerfilPedidosPage() {
  return <OrdersPageClient />;
}
