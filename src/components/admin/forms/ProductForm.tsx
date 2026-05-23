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
    <form className="grid gap-6 rounded-card border border-border-subtle bg-background-card p-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">{/* fields */}</div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : product ? 'Atualizar' : 'Criar produto'}
        </button>
      </div>
    </form>
  );
}
