import Link from 'next/link';

type ProductFiltersProps = {
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  selectedCategory?: string;
  search?: string;
  sort?: string;
};

export function ProductFilters({ categories, search = '', selectedCategory, sort = 'relevance' }: ProductFiltersProps) {
  return (
    <form action="/products" className="glass grid gap-4 rounded-2xl p-4 md:grid-cols-[1fr_auto_auto]">
      <label className="grid gap-2 text-sm text-text-secondary">
        Buscar
        <input className="input-field" type="search" name="q" defaultValue={search} placeholder="Nome do cafe" />
      </label>
      <label className="grid gap-2 text-sm text-text-secondary">
        Categoria
        <select className="input-field min-w-48" name="category" defaultValue={selectedCategory ?? ''}>
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm text-text-secondary">
        Ordenar
        <select className="input-field min-w-48" name="sort" defaultValue={sort}>
          <option value="relevance">Relevancia</option>
          <option value="price-asc">Menor preco</option>
          <option value="price-desc">Maior preco</option>
          <option value="newest">Novidades</option>
        </select>
      </label>
      <div className="flex items-end gap-3 md:col-span-3">
        <button type="submit" className="btn-primary">
          Filtrar
        </button>
        <Link href="/products" className="btn-ghost">
          Limpar
        </Link>
      </div>
    </form>
  );
}
