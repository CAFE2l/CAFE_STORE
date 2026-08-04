'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Category } from '@prisma/client';
import { CheckCircle2, Edit3, Eye, FolderKanban, Package, Plus, Power, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createCategoryAction, deleteCategoryAction, toggleCategoryStatusAction, updateCategoryAction } from '@/lib/admin/actions';
import { dateTime } from '@/lib/admin/formatters';
import { cn } from '@/lib/utils';
import { ActionGroup } from '@/components/admin/ui/ActionGroup';
import type { Action } from '@/components/admin/ui/ActionGroup';
import { ImageUploader } from '@/components/admin/ui/ImageUploader';

type CategoryWithCount = Category & { _count: { products: number } };

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Informe o nome.'),
  slug: z.string().min(2, 'Informe o slug.').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens.'),
  description: z.string().max(500).optional(),
  image: z.string().optional().nullable(),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

type CategoryManagerProps = {
  categories: CategoryWithCount[];
  summary: { total: number; active: number; inactive: number; linkedProducts: number };
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

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ type, message, onClose }: { type: 'success' | 'error'; message: string; onClose: () => void }) {
  return (
    <div
      className={cn(
        'fixed right-5 top-20 z-[90] flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl',
        type === 'success'
          ? 'border-emerald-400/20 bg-emerald-950/80 text-emerald-200'
          : 'border-red-400/20 bg-red-950/80 text-red-200',
      )}
    >
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Fechar" className="opacity-60 hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Category row ─────────────────────────────────────────────────────────────

function CategoryRow({
  category,
  onEdit,
  onToggle,
  onDelete,
}: {
  category: CategoryWithCount;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const actions: Action[] = [
    {
      type: 'link',
      href: `/admin/produtos?q=&status=all&category=${category.slug}`,
      label: 'Ver produtos',
      icon: <Eye className="h-3.5 w-3.5" />,
      variant: 'neutral',
    },
    {
      type: 'button',
      label: 'Editar categoria',
      icon: <Edit3 className="h-3.5 w-3.5" />,
      variant: 'blue',
      onClick: onEdit,
    },
  ];

  const moreActions = [
    {
      type: 'dropdown-item' as const,
      label: category.isActive ? 'Desativar' : 'Ativar',
      icon: <Power className="h-3.5 w-3.5" />,
      variant: 'orange' as const,
      onClick: onToggle,
    },
    {
      type: 'dropdown-item' as const,
      label: 'Excluir categoria',
      icon: <Trash2 className="h-3.5 w-3.5" />,
      variant: 'red' as const,
      disabled: category._count.products > 0,
      onClick: onDelete,
    },
  ];

  return (
    <article className="grid gap-4 px-5 py-4 transition-colors duration-150 hover:bg-white/[0.02] lg:grid-cols-[auto_1.25fr_1fr_auto] lg:items-center">
      {/* Thumbnail */}
      <div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] lg:block">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FolderKanban className="h-5 w-5 text-orange-300/60" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-white">{category.name}</h2>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                category.isActive
                  ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400',
              )}
            >
              {category.isActive ? 'Ativa' : 'Inativa'}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-xs text-zinc-500">{category.slug}</p>
          {category.description && (
            <p className="mt-1.5 line-clamp-1 text-sm text-zinc-400">{category.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-1 text-sm text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <Package className="h-3.5 w-3.5 text-orange-300/70" />
          {category._count.products} produto{category._count.products !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-zinc-600">Atualizada: {dateTime.format(category.updatedAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex justify-start lg:justify-end">
        <ActionGroup actions={actions} moreActions={moreActions} size="sm" />
      </div>
    </article>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CategoryManager({ categories, summary }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', slug: '', description: '', image: '', isActive: true },
  });

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  function openCreate() {
    setEditing(null);
    setImageUrl(null);
    form.reset({ name: '', slug: '', description: '', image: '', isActive: true });
    setOpen(true);
  }

  function openEdit(category: CategoryWithCount) {
    setEditing(category);
    setImageUrl(category.image ?? null);
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

  function closeModal() {
    setOpen(false);
    setEditing(null);
    setImageUrl(null);
  }

  function submit(values: CategoryFormValues) {
    startTransition(async () => {
      const payload = { ...values, image: imageUrl ?? null };
      const result = editing
        ? await updateCategoryAction({ ...payload, id: editing.id })
        : await createCategoryAction(payload);
      showToast(result.ok ? 'success' : 'error', result.message);
      if (result.ok) closeModal();
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
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Categorias</h1>
          <p className="mt-2 text-sm text-zinc-500">Gerencie taxonomia, status e vínculos do catálogo.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white shadow-led-brand transition hover:bg-orange-400"
        >
          <Plus className="h-4 w-4" />
          Nova categoria
        </button>
      </header>

      {/* Summary cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ['Total', summary.total],
            ['Ativas', summary.active],
            ['Inativas', summary.inactive],
            ['Produtos vinculados', summary.linkedProducts],
          ] as [string, number][]
        ).map(([label, value]) => (
          <article key={label} className="rounded-xl border border-white/10 bg-white/[0.035] p-4 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-white">{value}</p>
          </article>
        ))}
      </section>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25 shadow-card backdrop-blur">
        {categories.length ? (
          <div className="divide-y divide-white/[0.06]">
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={() => openEdit(category)}
                onToggle={() => toggle(category)}
                onDelete={() => remove(category)}
              />
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

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editing ? 'Editar categoria' : 'Nova categoria'}
                </h2>
                <p className="text-sm text-zinc-500">
                  {editing ? `Editando: ${editing.name}` : 'Preencha os dados da nova categoria.'}
                </p>
              </div>
              <button
                onClick={closeModal}
                aria-label="Fechar"
                className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={form.handleSubmit(submit)} className="grid gap-5 p-5">
              <div className="grid gap-5 md:grid-cols-2">
                {/* Name */}
                <label className="grid gap-2 text-sm text-zinc-300">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">Nome *</span>
                  <input
                    {...form.register('name', {
                      onChange: (e) => !editing && form.setValue('slug', slugify(e.target.value)),
                    })}
                    className="admin-input"
                    placeholder="Ex: Camisetas"
                  />
                  {form.formState.errors.name && (
                    <span className="text-xs text-red-300">{form.formState.errors.name.message}</span>
                  )}
                </label>

                {/* Slug */}
                <label className="grid gap-2 text-sm text-zinc-300">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">Slug *</span>
                  <input
                    {...form.register('slug')}
                    className="admin-input font-mono"
                    placeholder="camisetas"
                  />
                  {form.formState.errors.slug && (
                    <span className="text-xs text-red-300">{form.formState.errors.slug.message}</span>
                  )}
                </label>

                {/* Description */}
                <label className="grid gap-2 text-sm text-zinc-300 md:col-span-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">Descrição</span>
                  <textarea
                    {...form.register('description')}
                    rows={3}
                    className="min-h-[80px] w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                    placeholder="Descrição opcional da categoria"
                  />
                </label>
              </div>

              {/* Image uploader */}
              <ImageUploader
                label="Imagem da categoria"
                hint="PNG, JPG, WEBP • Máx. 5 MB"
                value={imageUrl}
                onChange={setImageUrl}
                uploadEndpoint="/api/admin/upload/categories"
                deleteEndpoint="/api/admin/upload/categories"
                aspectRatio="aspect-video"
              />

              {/* Active toggle */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition hover:border-orange-500/20">
                <div className="relative">
                  <input type="checkbox" {...form.register('isActive')} className="peer sr-only" />
                  <div className="h-6 w-10 rounded-full border border-white/[0.08] bg-zinc-800 transition-all peer-checked:border-orange-500/40 peer-checked:bg-orange-500/20">
                    <div className="h-5 w-5 translate-x-0.5 translate-y-0.5 rounded-full bg-zinc-500 shadow-sm transition-all duration-200 peer-checked:translate-x-[18px] peer-checked:bg-orange-400" />
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-white">Categoria ativa</span>
                  <p className="text-xs text-zinc-500">Visível na loja e nos filtros</p>
                </div>
              </label>

              {/* Footer */}
              <div className="flex justify-end gap-2 border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-10 rounded-lg border border-white/10 px-4 text-sm text-zinc-300 transition hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="h-10 rounded-lg bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
                >
                  {pending ? 'Salvando...' : editing ? 'Salvar alterações' : 'Criar categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
