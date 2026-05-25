import { CategoryManager } from '@/components/admin/CategoryManager';
import { getCategoriesPage } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export default async function CategoriasPage() {
  const data = await getCategoriesPage();

  return <CategoryManager categories={data.items} summary={data.summary} />;
}
