'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  AlertCircle,
  Check,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { couponCreateSchema, type CouponCreateInput } from '@/lib/validations/coupon';
import { createCouponAction, updateCouponAction, type ActionState } from '@/lib/actions/coupons';

type CouponData = {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  discount: number;
  minAmount: number | null;
  maxDiscount: number | null;
  maxUses: number;
  usagePerUser: number | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  active: boolean;
};

type Props = {
  mode: 'create' | 'edit';
  coupon?: CouponData;
  onSuccess?: () => void;
};

function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 16);
}

export function CouponForm({ mode, coupon, onSuccess }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ActionState | null>(null);
  const resultTimeout = useRef<ReturnType<typeof setTimeout>>();

  const isEdit = mode === 'edit';

  const form = useForm({
    resolver: zodResolver(couponCreateSchema),
    defaultValues: {
      code: coupon?.code ?? '',
      name: coupon?.name ?? '',
      description: coupon?.description ?? '',
      type: (coupon?.type ?? 'PERCENTAGE') as 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING',
      discount: coupon?.discount ?? 0,
      minAmount: coupon?.minAmount ?? undefined,
      maxDiscount: coupon?.maxDiscount ?? undefined,
      maxUses: coupon?.maxUses ?? undefined,
      usagePerUser: coupon?.usagePerUser ?? undefined,
      startsAt: toDateInputValue(coupon?.startsAt ?? null),
      expiresAt: toDateInputValue(coupon?.expiresAt ?? null),
      active: coupon?.active ?? true,
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const watchedType = watch('type');

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
        const input = data as unknown as CouponCreateInput;
        const res = isEdit && coupon
          ? await updateCouponAction(coupon.id, input)
          : await createCouponAction(input);
        setResult(res);
        if (res.ok) {
          router.refresh();
          onSuccess?.();
        }
      } catch {
        setResult({ ok: false, message: 'Erro inesperado ao salvar.' });
      } finally {
        setSaving(false);
      }
    },
    [isEdit, coupon, router, onSuccess],
  );

  const typeOptions = [
    { value: 'PERCENTAGE', label: 'Porcentagem' },
    { value: 'FIXED', label: 'Valor fixo' },
    { value: 'FREE_SHIPPING', label: 'Frete grátis' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
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
            {result.errors ? (
              <ul className="text-xs text-red-300">
                {Object.entries(result.errors).map(([key, msgs]) =>
                  msgs?.map((msg) => <li key={`${key}-${msg}`}>{msg}</li>),
                )}
              </ul>
            ) : null}
            <button type="button" onClick={() => setResult(null)} className="ml-2 opacity-60 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Code + Name */}
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Identificação</h3>
            <p className="text-xs text-zinc-500">Código visible para clientes e nome interno</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Código do cupom" error={errors.code?.message}>
            <input
              {...register('code')}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 font-mono text-sm text-white uppercase outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              placeholder="CAFE10"
            />
          </Field>
          <Field label="Nome interno">
            <input
              {...register('name')}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              placeholder="Ex: Campanha de lançamento"
            />
          </Field>
          <Field label="Descrição" className="sm:col-span-2">
            <textarea
              {...register('description')}
              rows={2}
              className="h-20 w-full resize-y rounded-xl border border-white/[0.08] bg-black/60 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              placeholder="Descrição interna do cupom"
            />
          </Field>
        </div>
      </div>

      {/* Discount Type */}
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Desconto</h3>
            <p className="text-xs text-zinc-500">Tipo e valor do benefício</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tipo de desconto">
            <select
              {...register('type')}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          <Field
            label={watchedType === 'PERCENTAGE' ? 'Valor (%)' : watchedType === 'FIXED' ? 'Valor (R$)' : 'Valor'}
            error={errors.discount?.message}
          >
            <div className="relative">
              {watchedType !== 'FREE_SHIPPING' && watchedType !== 'PERCENTAGE' ? (
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">R$</span>
              ) : null}
              <input
                type="number"
                step={watchedType === 'PERCENTAGE' ? '1' : '0.01'}
                min="0"
                disabled={watchedType === 'FREE_SHIPPING'}
                {...register('discount', { valueAsNumber: true })}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 disabled:opacity-40"
                placeholder={watchedType === 'PERCENTAGE' ? '10' : watchedType === 'FIXED' ? '20,00' : '—'}
              />
              {watchedType === 'PERCENTAGE' ? (
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">%</span>
              ) : null}
            </div>
          </Field>

          {watchedType === 'PERCENTAGE' ? (
            <Field label="Desconto máximo (R$)">
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('maxDiscount', { valueAsNumber: true })}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
                placeholder="Ex: 50"
              />
            </Field>
          ) : null}
        </div>
      </div>

      {/* Rules */}
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Regras</h3>
            <p className="text-xs text-zinc-500">Limites, validade e condições</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Valor mínimo do pedido (R$)">
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('minAmount', { valueAsNumber: true })}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              placeholder="Ex: 100"
            />
          </Field>
          <Field label="Limite total de usos">
            <input
              type="number"
              min="0"
              {...register('maxUses', { valueAsNumber: true })}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              placeholder="0 = ilimitado"
            />
          </Field>
          <Field label="Limite por usuário">
            <input
              type="number"
              min="0"
              {...register('usagePerUser', { valueAsNumber: true })}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20"
              placeholder="Ex: 1"
            />
          </Field>
          <div className="hidden sm:block" />

          <Field label="Data de início">
            <input
              type="datetime-local"
              {...register('startsAt')}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 [color-scheme:dark]"
            />
          </Field>
          <Field label="Data de expiração" error={errors.expiresAt?.message}>
            <input
              type="datetime-local"
              {...register('expiresAt')}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/60 px-4 text-sm text-white outline-none transition-all placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 [color-scheme:dark]"
            />
          </Field>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-6 shadow-lg">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <svg className="h-4 w-4 text-orange-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-white">Status</h3>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 transition-all hover:border-orange-500/20">
          <div className="relative">
            <input
              type="checkbox"
              {...register('active')}
              className="peer sr-only"
            />
            <div className="h-6 w-10 rounded-full border border-white/[0.08] bg-zinc-800 transition-all peer-checked:border-orange-500/40 peer-checked:bg-orange-500/20 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500/30">
              <div className="h-5 w-5 translate-x-0.5 translate-y-0.5 rounded-full bg-zinc-500 shadow-sm transition-all duration-200 peer-checked:translate-x-[18px] peer-checked:bg-orange-400 peer-checked:shadow-[0_0_12px_rgba(249,115,22,0.3)]" />
            </div>
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-white">Cupom ativo</span>
            <p className="text-xs text-zinc-500">Clientes podem usar este cupom no checkout</p>
          </div>
        </label>
      </div>

      {/* Floating bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-zinc-950/90 backdrop-blur-xl lg:left-60"
      >
        <div className="mx-auto flex items-center justify-between px-6 py-3.5 lg:px-8" style={{ maxWidth: 'calc(1280px + 3rem)' }}>
          <button
            type="button"
            onClick={() => router.push('/admin/cupons')}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:border-white/[0.15] hover:text-white"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>
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
                {isEdit ? 'Salvar alterações' : 'Criar cupom'}
              </>
            )}
          </button>
        </div>
      </motion.div>

      <div className="h-20" />
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`grid gap-1.5 ${className ?? ''}`}>
      {label !== ' ' ? (
        <span className="text-xs font-medium tracking-wide text-zinc-400 uppercase">{label}</span>
      ) : null}
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
