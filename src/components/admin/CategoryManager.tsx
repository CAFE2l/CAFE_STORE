'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Category } from '@prisma/client';
import { CheckCircle2, Edit3, Eye, FolderKanban, Package, Plus, Power, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createCategoryAction, deleteCategoryAction, toggleCategoryStatusAction, updateCategoryAction } from '@/lib/admin/actions';
import { dateTime } from '@/lib/admin/formatters';
import { cn } from '@/lib/utils';

type CategoryWithCount = Category & { _count: { products: number } };

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Informe o nome.'),
  slug: z.string().min(2, 'Informe o slug.').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens.'),
  description: z.string().max(500).optional(),
  image: z.string().optional(),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

type CategoryManagerProps = {
  categories: CategoryWithCount[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    linkedProducts: number;
  };
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function CategoryManager({ categories, summary }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', description: '', image: '', isActive: true },
  });

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  }

  function openCreate() {
    setEditing(null);
    form.reset({ name: '', slug: '', description: '', image: '', isActive: true });
    setOpen(true);
  }

  function openEdit(category: CategoryWithCount) {
    setEditing(category);
    form.reset({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      image: category.image ?? '',
      isActive: category.isActive,
    });
    setOpen(true);
  }

  function submit(values: CategoryFormValues) {
    startTransition(async () => {
      const result = editing ? await updateCategoryAction({ ...values, id: editing.id }) : await createCategoryAction(values);
      showToast(result.ok ? 'success' : 'error', result.message);
      if (result.ok) setOpen(false);
    });
  }

  function toggle(category: CategoryWithCount) {
    startTransition(async () => {
      const result = await toggleCategoryStatusAction(category.id);
      showToast(result.ok ? 'success' : 'error', result.message);
    });
  }

  function remove(category: CategoryWithCount) {
    if (!confirm(`Excluir a categoria "${category.name}"? Essa ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      showToast(result.ok ? 'success' : 'error', result.message);
    });
  }

  return (
    <div className="grid gap-5">
      {toast ? (
        <div className={cn('fixed right-5 top-20 z-[90] rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur', toast.type === 'success' ? 'border-emerald-400/20 bg-emerald-500/15 text-emerald-100' : 'border-red-400/20 bg-red-500/15 text-red-100')}>
          {toast.message}
        </div>
      ) : null}

      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Categorias</h1>
          <p className="mt-2 text-sm text-zinc-500">Gerencie taxonomia, status e vínculos do catálogo.</p>
        </div>
        <button onClick={openCreate} className="inline-flex h-11 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white shadow-led-brand transition hover:bg-orange-400">
          <Plus className="h-4 w-4" />
          Nova categoria
        </button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total', summary.total],
          ['Ativas', summary.active],
          ['Inativas', summary.inactive],
          ['Produtos vinculados', summary.linkedProducts],
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-white/10 bg-white/[0.035] p-4 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-white">{value}</p>
          </article>
        ))}
      </section>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25 shadow-card backdrop-blur">
        {categories.length ? (
          <div className="divide-y divide-white/10">
            {categories.map((category) => (
              <article key={category.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1.25fr_1fr_auto_auto] lg:items-center">
                <div className="flex min-w-0 gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-orange-400/20 bg-orange-500/10 text-orange-300">
                    <FolderKanban className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-white">{category.name}</h2>
                      <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-semibold', category.isActive ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300' : 'border-zinc-700 bg-zinc-900 text-zinc-400')}>
                        {category.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-zinc-500">{category.slug}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{category.description || 'Sem descrição.'}</p>
                  </div>
                </div>

                <div className="grid gap-1 text-sm text-zinc-400">
                  <span className="inline-flex items-center gap-2"><Package className="h-4 w-4 text-orange-300" /> {category._count.products} produtos vinculados</span>
                  <span className="text-xs text-zinc-600">Criada: {dateTime.format(category.createdAt)}</span>
                  <span className="text-xs text-zinc-600">Atualizada: {dateTime.format(category.updatedAt)}</span>
                </div>

                <Link href={`/admin/produtos?q=&status=all&category=${category.slug}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-zinc-300 transition hover:bg-white/5">
                  <Eye className="h-4 w-4" />
                  Produtos
                </Link>

                <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                  <button onClick={() => openEdit(category)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-300 transition hover:bg-white/5" aria-label="Editar categoria"><Edit3 className="h-4 w-4" /></button>
                  <button onClick={() => toggle(category)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-300 transition hover:bg-white/5" aria-label="Ativar ou desativar categoria"><Power className="h-4 w-4" /></button>
                  <button onClick={() => remove(category)} disabled={category._count.products > 0} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-300 transition hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Excluir categoria"><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid place-items-center px-6 py-16 text-center">
            <CheckCircle2 className="mb-4 h-8 w-8 text-zinc-700" />
            <h2 className="font-bold text-white">Nenhuma categoria cadastrada</h2>
            <p className="mt-2 text-sm text-zinc-500">Crie a primeira categoria para organizar o catálogo.</p>
          </div>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">{editing ? 'Editar categoria' : 'Nova categoria'}</h2>
                <p className="text-sm text-zinc-500">Dados salvos no PostgreSQL via Prisma.</p>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 hover:text-white" aria-label="Fechar"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={form.handleSubmit(submit)} className="grid gap-4 p-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-zinc-300">
                Nome
                <input {...form.register('name', { onChange: (event) => !editing && form.setValue('slug', slugify(event.target.value)) })} className="admin-input" />
                {form.formState.errors.name ? <span className="text-xs text-red-300">{form.formState.errors.name.message}</span> : null}
              </label>
              <label className="grid gap-2 text-sm text-zinc-300">
                Slug
                <input {...form.register('slug')} className="admin-input" />
                {form.formState.errors.slug ? <span className="text-xs text-red-300">{form.formState.errors.slug.message}</span> : null}
              </label>
              <label className="grid gap-2 text-sm text-zinc-300 md:col-span-2">
                Descrição
                <textarea {...form.register('description')} className="min-h-28 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm text-white outline-none focus:border-orange-400/60" />
              </label>
              <label className="grid gap-2 text-sm text-zinc-300">
                Imagem opcional
                <input {...form.register('image')} className="admin-input" placeholder="/images/categories/categoria.png" />
              </label>
              <label className="flex items-center gap-3 text-sm text-zinc-300">
                <input type="checkbox" {...form.register('isActive')} className="rounded border-white/20 bg-black text-orange-500" />
                Categoria ativa
              </label>
              <div className="flex justify-end gap-2 md:col-span-2">
                <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-white/10 px-4 text-sm text-zinc-300 hover:bg-white/5">Cancelar</button>
                <button disabled={pending} className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white disabled:opacity-60">{pending ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
