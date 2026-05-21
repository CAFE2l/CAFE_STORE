import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Produtos admin | Cafe Store',
  description: 'Gestao de produtos da Cafe Store.',
};

export default function AdminProductsPage() {
  return <main className="container-page py-16">Produtos admin</main>;
}
