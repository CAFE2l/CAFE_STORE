import type { Metadata } from 'next';
import { ProductForm } from '@/components/admin/forms/ProductForm';
import { getAdminCategories } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'Novo produto | Cafe Store',
  description: 'Cadastro de produto da Cafe Store.',
};

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const categories = await getAdminCategories();

  return (
    <main className="container-page grid gap-6 py-8">
      <h1 className="font-display text-4xl font-semibold text-text-primary">Novo produto</h1>
      <ProductForm categories={categories} />
    </main>
  );
}
