'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type CategoryFormProps = {
  category?: { id: string; name: string; slug: string; image?: string | null };
};

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch(category?.id ? `/api/admin/categories/${category.id}` : '/api/admin/categories', {
      method: category?.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        slug: formData.get('slug'),
        image: formData.get('image'),
      }),
    });
    const result = (await response.json()) as { success: boolean; error?: string };
    if (!result.success) {
      setError(result.error ?? 'Nao foi possivel salvar.');
      return;
    }
    router.refresh();
  }

  return (
    <form className="card grid gap-4 p-5" onSubmit={handleSubmit}>
      <Input label="Nome" name="name" defaultValue={category?.name ?? ''} />
      <Input label="Slug" name="slug" defaultValue={category?.slug ?? ''} />
      <Input label="Imagem" name="image" defaultValue={category?.image ?? ''} />
      {error ? <p className="text-sm text-status-error">{error}</p> : null}
      <Button type="submit">Salvar categoria</Button>
    </form>
  );
}
