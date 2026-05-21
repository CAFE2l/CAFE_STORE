'use client';

import { ProductStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type CategoryOption = { id: string; name: string };
type ProductFormValue = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  stock: number;
  images: string[];
  categoryId: string;
  status: ProductStatus;
  featured: boolean;
  variants?: unknown;
};

type ProductFormProps = {
  categories: CategoryOption[];
  product?: ProductFormValue;
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const images = String(formData.get('images') ?? '')
      .split('\n')
      .map((image) => image.trim())
      .filter(Boolean);
    const variantsText = String(formData.get('variants') ?? '').trim();
    const payload = {
      name,
      slug,
      description: String(formData.get('description') ?? ''),
      price: Number(formData.get('price')),
      oldPrice: formData.get('oldPrice') ? Number(formData.get('oldPrice')) : null,
      stock: Number(formData.get('stock')),
      images,
      categoryId: String(formData.get('categoryId') ?? ''),
      status: String(formData.get('status') ?? 'ACTIVE'),
      featured: formData.get('featured') === 'on',
      variants: variantsText ? JSON.parse(variantsText) : undefined,
    };
    const response = await fetch(product?.id ? `/api/admin/products/${product.id}` : '/api/admin/products', {
      method: product?.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { success: boolean; error?: string };
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Nao foi possivel salvar.');
      return;
    }

    router.push('/admin/products');
    router.refresh();
  }

  return (
    <form className="card grid gap-5 p-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Nome"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (!product) setSlug(slugify(event.target.value));
          }}
        />
        <Input label="Slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
        <Input label="Preco" name="price" type="number" step="0.01" defaultValue={product?.price ?? ''} />
        <Input label="Preco antigo" name="oldPrice" type="number" step="0.01" defaultValue={product?.oldPrice ?? ''} />
        <Input label="Estoque" name="stock" type="number" defaultValue={product?.stock ?? 0} />
        <label className="grid gap-2 text-sm text-text-secondary">
          Categoria
          <select className="input-field" name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.id ?? ''}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-text-secondary">
          Status
          <select className="input-field" name="status" defaultValue={product?.status ?? 'ACTIVE'}>
            <option value="ACTIVE">Ativo</option>
            <option value="INACTIVE">Inativo</option>
            <option value="OUT_OF_STOCK">Sem estoque</option>
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm text-text-secondary">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Destaque
        </label>
      </div>
      <label className="grid gap-2 text-sm text-text-secondary">
        Descricao
        <textarea className="input-field min-h-32" name="description" defaultValue={product?.description ?? ''} />
      </label>
      <label className="grid gap-2 text-sm text-text-secondary">
        Imagens Cloudinary, uma URL por linha
        <textarea className="input-field min-h-24 font-mono text-xs" name="images" defaultValue={product?.images.join('\n') ?? ''} />
      </label>
      <label className="grid gap-2 text-sm text-text-secondary">
        Variantes JSON
        <textarea className="input-field min-h-24 font-mono text-xs" name="variants" defaultValue={product?.variants ? JSON.stringify(product.variants, null, 2) : ''} />
      </label>
      {error ? <p className="text-sm text-status-error">{error}</p> : null}
      <Button type="submit" loading={loading}>Salvar produto</Button>
    </form>
  );
}
