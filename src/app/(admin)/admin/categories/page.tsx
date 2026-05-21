import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categorias | Cafe Store',
  description: 'Gestao de categorias da Cafe Store.',
};

export default function AdminCategoriesPage() {
  return <main className="container-page py-16">Categorias</main>;
}
