'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Gift,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { dateTime, toMoney } from '@/lib/admin/formatters';
import { deleteCouponAction, toggleCouponStatusAction } from '@/lib/actions/coupons';
import { Toast } from '@/components/ui/Toast';

type CouponRow = {
  id: string;
  code: string;
  name: string | null;
  type: string;
  discount: number;
  minAmount: number | null;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  _count: { usages: number };
};

type Props = {
  coupons: CouponRow[];
};

function statusVariant(active: boolean, expiresAt: Date | null) {
  if (!active) return 'muted' as const;
  if (expiresAt && new Date() > expiresAt) return 'danger' as const;
  return 'success' as const;
}

function statusLabel(active: boolean, expiresAt: Date | null) {
  if (!active) return 'Inativo';
  if (expiresAt && new Date() > expiresAt) return 'Expirado';
  return 'Ativo';
}

function typeLabel(type: string) {
  switch (type) {
    case 'PERCENTAGE': return '%';
    case 'FIXED': return 'R$';
    case 'FREE_SHIPPING': return 'Frete';
    default: return type;
  }
}

function formatDiscount(type: string, discount: number) {
  if (type === 'FREE_SHIPPING') return 'Grátis';
  if (type === 'PERCENTAGE') return `${discount}%`;
  return toMoney(discount);
}

export function CouponsTable({ coupons }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmDelete(id: string) {
    setDeletingId(id);
  }

  function doDelete() {
    if (!deletingId) return;
    startTransition(async () => {
      const result = await deleteCouponAction(deletingId);
      setToast({ type: result.ok ? 'success' : 'error', message: result.message });
      setDeletingId(null);
      router.refresh();
    });
  }

  async function toggleStatus(id: string) {
    startTransition(async () => {
      const result = await toggleCouponStatusAction(id);
      setToast({ type: result.ok ? 'success' : 'error', message: result.message });
      router.refresh();
    });
  }

  async function duplicateCoupon(coupon: CouponRow) {
    startTransition(async () => {
      try {
        const { createCouponAction } = await import('@/lib/actions/coupons');
        const result = await createCouponAction({
          code: `${coupon.code}-COPY`,
          name: coupon.name ? `${coupon.name} (cópia)` : '',
          description: '',
          type: coupon.type as 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING',
          discount: coupon.discount,
          minAmount: coupon.minAmount,
          maxDiscount: null,
          maxUses: coupon.maxUses,
          usagePerUser: null,
          startsAt: null,
          expiresAt: coupon.expiresAt?.toISOString() ?? null,
          active: false,
        });
        setToast({ type: result.ok ? 'success' : 'error', message: result.message });
        router.refresh();
      } catch {
        setToast({ type: 'error', message: 'Erro ao duplicar cupom.' });
      }
    });
  }

  return (
    <>
      {toast ? (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      ) : null}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25 shadow-card backdrop-blur">
        {coupons.length === 0 ? (
          <div className="grid place-items-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
              <Gift className="h-7 w-7 text-orange-400" />
            </div>
            <p className="mt-5 text-base font-semibold text-white">Nenhum cupom encontrado</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
              Nenhum cupom corresponde aos filtros aplicados. Tente ajustar a busca ou criar um novo cupom.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {coupons.map((coupon, i) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className="grid gap-3 px-5 py-4 lg:grid-cols-[1.5fr_auto_auto_auto_auto] lg:items-center"
              >
                {/* Code + Name */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono font-bold text-white">{coupon.code}</span>
                    {coupon.name ? (
                      <span className="hidden truncate text-xs text-zinc-500 sm:inline">• {coupon.name}</span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                    <span>{typeLabel(coupon.type)}</span>
                    <span>•</span>
                    <span>{coupon.usedCount}/{coupon.maxUses || '∞'} usos</span>
                    {coupon.expiresAt ? (
                      <>
                        <span>•</span>
                        <span>Expira {dateTime.format(coupon.expiresAt)}</span>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Discount value */}
                <span className="text-sm font-semibold text-orange-300">
                  {formatDiscount(coupon.type, coupon.discount)}
                </span>

                {/* Status badge */}
                <AdminBadge variant={statusVariant(coupon.active, coupon.expiresAt)}>
                  {statusLabel(coupon.active, coupon.expiresAt)}
                </AdminBadge>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/admin/cupons/${coupon.id}/editar`}
                    title="Editar cupom"
                    className="grid h-8 w-8 place-items-center rounded-md border border-white/8 bg-white/[0.06] text-zinc-300 transition hover:bg-[rgba(249,115,22,0.15)] hover:text-orange-400"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    title={coupon.active ? 'Desativar' : 'Ativar'}
                    onClick={() => toggleStatus(coupon.id)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-white/8 bg-white/[0.06] text-zinc-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {coupon.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    title="Duplicar cupom"
                    onClick={() => duplicateCoupon(coupon)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-white/8 bg-white/[0.06] text-zinc-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Excluir cupom"
                    onClick={() => confirmDelete(coupon.id)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-white/8 bg-[rgba(239,68,68,0.08)] text-[rgba(239,68,68,0.6)] transition hover:bg-[rgba(239,68,68,0.15)] hover:text-[#ef4444]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deletingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[rgba(239,68,68,0.3)] bg-[#111111] p-7 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[rgba(239,68,68,0.12)] p-3">
                <Trash2 className="h-6 w-6 text-[#ef4444]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Excluir cupom?</h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              Essa ação não poderá ser desfeita. Se esse cupom já foi usado em pedidos, considere apenas desativá-lo.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="h-10 rounded-lg border border-white/15 px-4 text-sm text-zinc-300 transition hover:border-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={doDelete}
                disabled={pending}
                className="flex items-center gap-2 rounded-lg bg-[#ef4444] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(239,68,68,0.3)] hover:bg-[#dc2626] disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {pending ? 'Excluindo...' : 'Excluir cupom'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
