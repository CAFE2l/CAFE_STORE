import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/forms/ProductForm';
import { getAdminCategories, getAdminProduct } from '@/lib/admin';

type EditProductPageProps = {
  params: {
    id: string;
  };
};

export function generateMetadata({ params }: EditProductPageProps): Metadata {
  return {
    title: `Editar produto ${params.id} | Cafe Store`,
    description: 'Edicao de produto da Cafe Store.',
  };
}

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: EditProductPageProps) {
  const [product, categories] = await Promise.all([getAdminProduct(params.id), getAdminCategories()]);
  if (!product) notFound();

  return (
    <main className="container-page grid gap-6 py-8">
      <h1 className="font-display text-4xl font-semibold text-text-primary">Editar produto</h1>
      <ProductForm categories={categories} product={product} />
    </main>
  );
}
