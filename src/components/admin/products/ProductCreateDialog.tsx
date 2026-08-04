'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductStatus, type Category } from '@prisma/client';
import { Loader2, PackagePlus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createProductAction } from '@/lib/admin/actions';
import { generateSku, sanitizeSku } from '@/lib/sku';

const schema = z.object({
  name: z.string().min(3),
  sku: z.string().regex(/^[A-Z0-9-]*$/).max(30).optional(),
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
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const form = useForm<ProductForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      sku: '',
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
      const result = await createProductAction({ ...values, images });
      setMessage(result.message);
      if (result.ok) {
        form.reset();
        setImages([]);
        setImageUrl('');
        setOpen(false);
      }
    });
  }

  function addImage() {
    const trimmed = imageUrl.trim();
    if (!trimmed || images.includes(trimmed)) return;
    setImages((prev) => [...prev, trimmed]);
    setImageUrl('');
  }

  async function uploadImage(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload?folder=products', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage(json.error ?? 'Falha no upload.');
        return;
      }
      setImages((prev) => [...prev, json.data.url]);
    } finally {
      setUploading(false);
    }
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
              <input type="hidden" {...form.register('sku')} />
              <Field label="Nome" error={form.formState.errors.name?.message}>
                <input {...form.register('name')} className="admin-input" />
              </Field>
              <Field label="SKU" error={form.formState.errors.sku?.message}>
                <div className="relative">
                  <input
                    value={form.watch('sku') ?? ''}
                    onChange={(event) => form.setValue('sku', sanitizeSku(event.target.value), { shouldValidate: true })}
                    className="admin-input pr-20 font-mono uppercase"
                    placeholder="CAF-CHA-ABC123"
                    maxLength={30}
                  />
                  <button
                    type="button"
                    onClick={() => form.setValue('sku', generateSku(form.watch('name')), { shouldValidate: true })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-orange-500/10 px-2 py-1 text-[10px] font-medium text-orange-400 transition-all hover:bg-orange-500/20 hover:text-orange-300"
                  >
                    Gerar
                  </button>
                </div>
                <span className="text-xs text-zinc-600">Gerado automaticamente, mas editável.</span>
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
              <Field label="Imagens">
                <div className="flex gap-2">
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                    className="admin-input flex-1"
                    placeholder="https://..."
                  />
                  <button type="button" onClick={addImage} className="h-10 rounded-lg border border-white/10 px-3 text-sm text-zinc-300 hover:bg-white/5">+</button>
                  <label className="flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-zinc-300 hover:bg-white/5">
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Upload
                    <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => void uploadImage(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
                {images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {images.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt={`img-${i}`} className="h-14 w-14 rounded-lg object-cover" />
                        <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
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
