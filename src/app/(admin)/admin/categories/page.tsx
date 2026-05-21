import type { Metadata } from 'next';
import { CategoryForm } from '@/components/admin/forms/CategoryForm';
import { getAdminCategories } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'Categorias | Cafe Store',
  description: 'Gestao de categorias da Cafe Store.',
};

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <main className="container-page grid gap-6 py-8">
      <h1 className="font-display text-4xl font-semibold text-text-primary">Categorias</h1>
      <CategoryForm />
      <section className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <article key={category.id} className="card p-5">
            <p className="font-semibold text-text-primary">{category.name}</p>
            <p className="mt-1 text-sm text-text-muted">{category.slug}</p>
            <p className="mt-3 text-sm text-text-secondary">{category._count.products} produtos</p>
          </article>
        ))}
        {categories.length === 0 ? <p className="text-sm text-text-secondary">Nenhuma categoria cadastrada.</p> : null}
      </section>
    </main>
  );
}
