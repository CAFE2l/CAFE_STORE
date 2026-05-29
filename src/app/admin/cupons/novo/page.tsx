import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';
import { CouponForm } from '@/components/admin/coupons/coupon-form';

export default function NewCouponPage() {
  return (
    <div className="grid gap-8">
      {/* Breadcrumb + Header */}
      <div className="grid gap-4">
        <nav className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/admin" className="transition hover:text-zinc-300">Admin</Link>
          <span className="text-zinc-700">/</span>
          <Link href="/admin/cupons" className="transition hover:text-zinc-300">Cupons</Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-400">Novo</span>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.08)]">
            <Gift className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Novo cupom</h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              Crie um novo cupom promocional para sua loja.
            </p>
          </div>
        </div>
      </div>

      <CouponForm mode="create" />
    </div>
  );
}
