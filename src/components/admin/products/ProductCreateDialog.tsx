'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductStatus, type Category } from '@prisma/client';
import { PackagePlus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createProductAction } from '@/lib/admin/actions';

const schema = z.object({
  name: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1),
  status: z.nativeEnum(ProductStatus),
  featured: z.boolean().optional(),
});

type ProductForm = z.infer<typeof schema>;

export function ProductCreateDialog({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<ProductForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: categories[0]?.id ?? '',
      status: ProductStatus.ACTIVE,
      featured: false,
    },
  });

  function submit(values: ProductForm) {
    setMessage(null);
    startTransition(async () => {
      const result = await createProductAction(values);
      setMessage(result.message);
      if (result.ok) {
        form.reset();
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white shadow-led-brand transition hover:bg-orange-400">
        <PackagePlus className="h-4 w-4" />
        Novo produto
      </button>
      {open ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">Criar produto</h2>
                <p className="text-sm text-zinc-500">Produto salvo direto no PostgreSQL via Server Action.</p>
              </div>
              <button aria-label="Fechar" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={form.handleSubmit(submit)} className="grid gap-4 p-5 md:grid-cols-2">
              <Field label="Nome" error={form.formState.errors.name?.message}>
                <input {...form.register('name')} className="admin-input" />
              </Field>
              <Field label="Slug" error={form.formState.errors.slug?.message}>
                <input {...form.register('slug')} className="admin-input" placeholder="camiseta-personalizada" />
              </Field>
              <Field label="Preço" error={form.formState.errors.price?.message}>
                <input type="number" step="0.01" {...form.register('price', { valueAsNumber: true })} className="admin-input" />
              </Field>
              <Field label="Estoque" error={form.formState.errors.stock?.message}>
                <input type="number" {...form.register('stock', { valueAsNumber: true })} className="admin-input" />
              </Field>
              <Field label="Categoria" error={form.formState.errors.categoryId?.message}>
                <select {...form.register('categoryId')} className="admin-input bg-zinc-950">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select {...form.register('status')} className="admin-input bg-zinc-950">
                  <option value={ProductStatus.ACTIVE}>Ativo</option>
                  <option value={ProductStatus.INACTIVE}>Inativo</option>
                  <option value={ProductStatus.OUT_OF_STOCK}>Sem estoque</option>
                </select>
              </Field>
              <label className="flex items-center gap-3 text-sm text-zinc-300">
                <input type="checkbox" {...form.register('featured')} className="rounded border-white/20 bg-black text-orange-500" />
                Destacar produto
              </label>
              {message ? <p className="text-sm text-orange-200 md:col-span-2">{message}</p> : null}
              <div className="flex justify-end gap-2 md:col-span-2">
                <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-white/10 px-4 text-sm text-zinc-300 hover:bg-white/5">
                  Cancelar
                </button>
                <button disabled={pending} className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white disabled:opacity-60">
                  {pending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm text-zinc-300">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
