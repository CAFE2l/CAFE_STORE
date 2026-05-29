import Link from 'next/link';
import { Gift, Plus } from 'lucide-react';
import { getCouponsPage } from '@/lib/admin/queries';
import { getCouponMetrics } from '@/lib/actions/coupons';
import { CouponMetrics } from '@/components/admin/coupons/coupon-metrics';
import { CouponsTable } from '@/components/admin/coupons/coupons-table';
import { CouponTutorial } from '@/components/admin/coupons/coupon-tutorial';
import { AdminFilters, EmptyPanel } from '@/components/admin/ui/AdminTable';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function CuponsPage({ searchParams }: Props) {
  const q = String(searchParams?.q ?? '').trim().toLowerCase();
  const status = String(searchParams?.status ?? 'all');
  const type = String(searchParams?.type ?? 'all');

  const [allCoupons, metrics] = await Promise.all([
    getCouponsPage(),
    getCouponMetrics(),
  ]);

  const coupons = allCoupons
    .map((c) => ({
      ...c,
      discount: c.discount.toNumber(),
      minAmount: c.minAmount?.toNumber() ?? null,
    }))
    .filter((c) => {
      if (q && !c.code.toLowerCase().includes(q) && !(c.name ?? '').toLowerCase().includes(q) && !(c.description ?? '').toLowerCase().includes(q)) {
        return false;
      }
      if (status === 'active' && !c.active) return false;
      if (status === 'inactive' && c.active) return false;
      if (status === 'expired' && (!c.expiresAt || new Date() <= c.expiresAt)) return false;
      if (type !== 'all' && c.type !== type) return false;
      return true;
    });

  const filterAction = '/admin/cupons';

  return (
    <div className="grid gap-8 pb-24">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.08)]">
              <Gift className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">Cupons</h1>
              <p className="mt-0.5 text-sm text-zinc-500">
                Crie, gerencie e acompanhe campanhas promocionais.
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/admin/cupons/novo"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:from-orange-400 hover:to-orange-500 active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          Novo cupom
        </Link>
      </div>

      {/* Metrics */}
      <CouponMetrics metrics={metrics} />

      {/* Main content grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-5">
          {/* Filters */}
          <AdminFilters
            q={String(searchParams?.q ?? '')}
            status={status}
            statusLabel="Status"
            options={[
              { label: 'Todos', value: 'all' },
              { label: 'Ativos', value: 'active' },
              { label: 'Inativos', value: 'inactive' },
              { label: 'Expirados', value: 'expired' },
            ]}
            action={filterAction}
          />

          {/* Type filter */}
          <form action={filterAction} className="flex gap-2">
            <select
              name="type"
              defaultValue={type}
              aria-label="Tipo de desconto"
              className="h-11 rounded-lg border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-orange-400/60"
            >
              <option value="all">Todos os tipos</option>
              <option value="PERCENTAGE">Porcentagem</option>
              <option value="FIXED">Valor fixo</option>
              <option value="FREE_SHIPPING">Frete grátis</option>
            </select>
            <button className="h-11 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white shadow-led-brand transition hover:bg-orange-400">
              Filtrar
            </button>
            {(q || status !== 'all' || type !== 'all') ? (
              <Link
                href="/admin/cupons"
                className="flex h-11 items-center rounded-lg border border-white/10 px-4 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white"
              >
                Limpar
              </Link>
            ) : null}
          </form>

          {/* Table */}
          {coupons.length > 0 ? (
            <CouponsTable coupons={coupons} />
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25 shadow-card backdrop-blur">
              <EmptyPanel
                title="Nenhum cupom encontrado"
                description={q || status !== 'all' || type !== 'all'
                  ? 'Ajuste os filtros ou a busca para encontrar cupons.'
                  : 'Crie seu primeiro cupom para oferecer descontos, campanhas de lançamento ou benefícios para clientes VIP.'}
              />
            </div>
          )}
        </div>

        {/* Tutorial sidebar */}
        <div className="hidden xl:block">
          <div className="sticky top-24">
            <CouponTutorial />
          </div>
        </div>
      </div>

      {/* Tutorial on mobile */}
      <div className="xl:hidden">
        <CouponTutorial />
      </div>
    </div>
  );
}
