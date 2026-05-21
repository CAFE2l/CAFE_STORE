import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carrinho | Cafe Store',
  description: 'Carrinho de compras da Cafe Store.',
};

export default function CartPage() {
  return <main className="container-page py-16">Carrinho</main>;
}
