'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductStatus } from '@prisma/client';
import { useForm } from 'react-hook-form';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  GripVertical,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productEditSchema, type ProductEditInput } from '@/lib/validations/product';
import { updateProductAction, type ActionState } from '@/lib/actions/products';

type CategoryOption = { id: string; name: string };

type ProductData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  oldPrice: number | null;
  stock: number;
  images: string[];
  categoryId: string;
  status: ProductStatus;
  featured: boolean;
  variants: unknown;
};

type Props = {
  product: ProductData;
  categories: CategoryOption[];
};

const statusColors: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  [ProductStatus.INACTIVE]: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25',
  [ProductStatus.OUT_OF_STOCK]: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
};

const statusLabels: Record<ProductStatus, string> = {
  [ProductStatus.ACTIVE]: 'Publicado',
  [ProductStatus.INACTIVE]: 'Inativo',
  [ProductStatus.OUT_OF_STOCK]: 'Sem estoque',
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ActionState | null>(null);
  const autogenSlug = useRef(true);
  const resultTimeout = useRef<ReturnType<typeof setTimeout>>();

  const form = useForm({
    resolver: zodResolver(productEditSchema),
    defaultValues: {
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      shortDescription: product.shortDescription ?? '',
      price: product.price as number | undefined,
      oldPrice: product.oldPrice ?? undefined,
      stock: product.stock as number | undefined,
      categoryId: product.categoryId,
      status: product.status,
      featured: product.featured,
      images: product.images,
      variants: product.variants ?? undefined,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const watchedName = watch('name');
  const watchedSlug = watch('slug');
  const watchedImages = watch('images') ?? [];
  const watchedFeatured = watch('featured');
  const watchedStatus: ProductStatus = watch('status') ?? ProductStatus.ACTIVE;

  useEffect(() => {
    if (autogenSlug.current && watchedName && (watchedSlug === slugify(product.name) || !watchedSlug)) {
      const generated = slugify(watchedName);
      setValue('slug', generated, { shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedName]);

  useEffect(() => {
    if (resultTimeout.current) clearTimeout(resultTimeout.current);
    if (result) {
      resultTimeout.current = setTimeout(() => setResult(null), 5000);
    }
    return () => {
      if (resultTimeout.current) clearTimeout(resultTimeout.current);
    };
  }, [result]);

  const onSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      setSaving(true);
      setResult(null);
      try {
        const input = data as unknown as ProductEditInput;
        const res = await updateProductAction(product.id, input);
        setResult(res);
        if (res.ok) {
          router.refresh();
        }
      } catch {
        setResult({ ok: false, message: 'Erro inesperado ao salvar.' });
      } finally {
        setSaving(false);
      }
    },
    [product.id, router],
  );

  function addImage() {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;
    if (watchedImages.includes(trimmed)) return;
    setValue('images', [...watchedImages, trimmed], { shouldValidate: false });
    setImageUrl('');
  }

  function removeImage(index: number) {
    setValue('images', watchedImages.filter((_url: string, i: number) => i !== index), { shouldValidate: false });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* Toast */}
      <AnimatePresence>
        {result ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`fixed right-6 top-24 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm font-medium shadow-2xl backdrop-blur-xl ${
              result.ok
                ? 'border-emerald-500/25 bg-emerald-950/80 text-emerald-300'
                : 'border-red-500/25 bg-red-950/80 text-red-300'
            }`}
          >
            {result.ok ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{result.message}</span>
            <button type="button" onClick={() => setResult(null)} className="ml-2 opacity-60 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Main Column */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid gap-6"
      >
        {/* Basic Info Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg transition-all duration-200 hover:border-white/[0.12]">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.646-5.647m0 0l5.646-5.647m-5.647 5.647h12.754" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Informações principais</h3>
              <p className="text-xs text-zinc-500">Nome, slug e descrições do produto</p>
            </div>
          </div>

          <div className="grid gap-5">
            <Field label="Nome do produto" error={errors.name?.message}>
              <input
                {...register('name')}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                placeholder="Ex: Camiseta Premium"
              />
            </Field>

            <Field label="Slug" error={errors.slug?.message}>
              <input
                {...register('slug')}
                onFocus={() => { autogenSlug.current = false; }}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                placeholder="camiseta-premium"
              />
            </Field>

            <Field label="Descrição curta" error={errors.shortDescription?.message}>
              <textarea
                {...register('shortDescription')}
                rows={2}
                className="h-20 w-full resize-y rounded-xl border border-white/[0.08] bg-black/60 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                placeholder="Breve descrição para cards e vitrine"
              />
            </Field>

            <Field label="Descrição completa" error={errors.description?.message}>
              <textarea
                {...register('description')}
                rows={5}
                className="h-28 w-full resize-y rounded-xl border border-white/[0.08] bg-black/60 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                placeholder="Descrição detalhada do produto"
              />
            </Field>
          </div>
        </div>

        {/* Images Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <ImagePlus className="h-4 w-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Imagens</h3>
              <p className="text-xs text-zinc-500">URLs das imagens do produto</p>
            </div>
          </div>

          <div className="mb-4 flex gap-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
              className="h-11 flex-1 rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              placeholder="https://... URL da imagem"
            />
            <button
              type="button"
              onClick={addImage}
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-dashed border-orange-500/30 bg-orange-500/5 px-4 text-sm font-medium text-orange-400 transition-all hover:border-orange-500/50 hover:bg-orange-500/10"
            >
              <ImagePlus className="h-4 w-4" />
              Adicionar
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {watchedImages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/[0.06] py-8 text-sm text-zinc-600"
              >
                <ImagePlus className="h-8 w-8 text-zinc-700" />
                Nenhuma imagem adicionada
              </motion.div>
            ) : (
              <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {watchedImages.map((url: string, index: number) => (
                  <motion.div
                    key={`${url}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="group/image relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-black/40"
                  >
                    <Image
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      fill
                      className="object-cover transition-all duration-300 group-hover/image:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover/image:bg-black/40">
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="scale-0 rounded-full bg-red-500/80 p-1.5 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 group-hover/image:scale-100 group-hover/image:opacity-100 hover:bg-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-medium text-white backdrop-blur-sm">
                      {index + 1}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Sidebar Column */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid gap-6"
      >
        {/* Status Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <ChevronDown className="h-4 w-4 text-orange-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Status do produto</h3>
          </div>

          <div className="grid gap-5">
            <Field label="Status">
              <select
                {...register('status')}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              >
                <option value={ProductStatus.ACTIVE}>Ativo</option>
                <option value={ProductStatus.INACTIVE}>Inativo</option>
                <option value={ProductStatus.OUT_OF_STOCK}>Sem estoque</option>
              </select>
            </Field>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 transition-all hover:border-orange-500/20">
              <div className="relative">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="peer sr-only"
                />
                <div className="h-6 w-10 rounded-full border border-white/[0.08] bg-zinc-800 transition-all peer-checked:border-orange-500/40 peer-checked:bg-orange-500/20 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500/30">
                  <div className="h-5 w-5 translate-x-0.5 translate-y-0.5 rounded-full bg-zinc-500 shadow-sm transition-all duration-200 peer-checked:translate-x-[18px] peer-checked:bg-orange-400 peer-checked:shadow-[0_0_12px_rgba(249,115,22,0.3)]" />
                </div>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-white">Produto em destaque</span>
                <p className="text-xs text-zinc-500">Aparece na vitrine principal</p>
              </div>
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3">
              <div className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border ${statusColors[watchedStatus]}`}>
                {statusLabels[watchedStatus]}
              </div>
              <span className="text-xs text-zinc-500">Visível na loja</span>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">Preço e estoque</h3>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preço" error={errors.price?.message}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 pl-8 pr-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                    placeholder="0,00"
                  />
                </div>
              </Field>
              <Field label="Preço promocional">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('oldPrice', { valueAsNumber: true, setValueAs: (v: string) => (v === '' ? undefined : Number(v)) })}
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 pl-8 pr-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                    placeholder="0,00"
                  />
                </div>
              </Field>
            </div>
            <Field label="Estoque" error={errors.stock?.message}>
              <input
                type="number"
                min="0"
                {...register('stock', { valueAsNumber: true })}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                placeholder="0"
              />
            </Field>
          </div>
        </div>

        {/* Category Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
              <GripVertical className="h-4 w-4 text-orange-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Categoria</h3>
          </div>

          <Field label="Categoria" error={errors.categoryId?.message}>
            <select
              {...register('categoryId')}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </motion.div>

      {/* Floating bottom bar with save button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-zinc-950/90 backdrop-blur-xl lg:left-60"
      >
        <div className="mx-auto flex items-center justify-between px-6 py-3.5 lg:px-8" style={{ maxWidth: 'calc(1280px + 3rem)' }}>
          <button
            type="button"
            onClick={() => router.push('/admin/produtos')}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:border-white/[0.15] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-zinc-600 sm:block">
              {watchedImages.length > 0 && `${watchedImages.length} imagem${watchedImages.length > 1 ? 'ns' : ''} · `}
              {statusLabels[watchedStatus]}
            </span>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:from-orange-400 hover:to-orange-500 hover:shadow-orange-500/30 active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar alterações
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Bottom spacer for floating bar */}
      <div className="h-20 lg:col-span-2" />
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">{label}</span>
      {children}
      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-xs text-red-400"
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </motion.p>
      ) : null}
    </label>
  );
}
