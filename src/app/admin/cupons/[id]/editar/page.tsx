import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Gift } from 'lucide-react';
import { getCouponById } from '@/lib/actions/coupons';
import { CouponForm } from '@/components/admin/coupons/coupon-form';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  const coupon = await getCouponById(id);

  if (!coupon) {
    notFound();
  }

  const couponData = {
    ...coupon,
    type: coupon.type as 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING',
  };

  return (
    <div className="grid gap-8">
      {/* Breadcrumb + Header */}
      <div className="grid gap-4">
        <nav className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/admin" className="transition hover:text-zinc-300">Admin</Link>
          <span className="text-zinc-700">/</span>
          <Link href="/admin/cupons" className="transition hover:text-zinc-300">Cupons</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-400">Editar</span>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.08)]">
            <Gift className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              {coupon.code}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              Edite as configurações do cupom. Alterações salvam automaticamente.
            </p>
          </div>
        </div>

        {/* Quick metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600">
          <span>Tipo: <span className="font-mono text-zinc-500">
            {coupon.type === 'PERCENTAGE' ? 'Porcentagem' : coupon.type === 'FIXED' ? 'Valor fixo' : 'Frete grátis'}
          </span></span>
          <span className="hidden sm:inline">·</span>
          <span>Usos: <span className="font-mono text-zinc-500">{coupon.usedCount}/{coupon.maxUses || '∞'}</span></span>
          <span className="hidden sm:inline">·</span>
          <span>Status: <span className={`font-mono ${coupon.active ? 'text-emerald-400' : 'text-zinc-400'}`}>
            {coupon.active ? 'Ativo' : 'Inativo'}
          </span></span>
        </div>
      </div>

      <CouponForm mode="edit" coupon={couponData} />
    </div>
  );
}
