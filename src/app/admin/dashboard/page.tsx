import { BadgeDollarSign, PackageCheck, ShoppingBag, Star, Users, WalletCards } from 'lucide-react';
import MetricCard from '@/components/admin/MetricCard';
import SalesChart, { OrderStatusChart } from '@/components/admin/charts/SalesChart';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { getDashboardData } from '@/lib/admin/queries';
import { dateTime, toMoney } from '@/lib/admin/formatters';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="grid gap-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-300">Admin Console</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Visão operacional com métricas reais do PostgreSQL, receita, pedidos, catálogo e sinais de qualidade.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
          Atualizado em tempo real pelo servidor
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="xl:col-span-2"><MetricCard title="Vendas hoje" value={toMoney(data.metrics.revenueToday)} subtitle={`${data.metrics.ordersToday} pedidos hoje`} icon={BadgeDollarSign} tone="orange" /></div>
        <div className="xl:col-span-2"><MetricCard title="Faturamento mensal" value={toMoney(data.metrics.monthlyRevenue)} subtitle="Pedidos não cancelados" icon={WalletCards} tone="red" /></div>
        <MetricCard title="Produtos ativos" value={data.metrics.activeProducts} subtitle="Catálogo publicado" icon={PackageCheck} tone="yellow" />
        <MetricCard title="Usuários" value={data.metrics.users} subtitle={`${data.metrics.pendingReviews} avaliações pendentes`} icon={Users} tone="neutral" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <article className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-card backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Receita semanal</h2>
              <p className="text-sm text-zinc-500">Receita e volume dos últimos 7 dias.</p>
            </div>
          </div>
          <SalesChart data={data.weeklyRevenue} />
        </article>

        <article className="rounded-xl border border-white/10 bg-white/[0.035] p-5 shadow-card backdrop-blur">
          <h2 className="text-lg font-bold text-white">Status dos pedidos</h2>
          <p className="text-sm text-zinc-500">Distribuição operacional.</p>
          <OrderStatusChart data={data.orderStatus} />
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] shadow-card backdrop-blur">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-bold text-white">Pedidos recentes</h2>
          </div>
          <div className="divide-y divide-white/10">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1fr_1.2fr_auto_auto] md:items-center">
                <span className="font-mono text-zinc-300">#{order.id.slice(0, 8)}</span>
                <span className="text-zinc-400">{order.customer}</span>
                <AdminBadge variant={order.status}>{order.status}</AdminBadge>
                <span className="font-semibold text-white">{toMoney(order.total)}</span>
                <span className="text-xs text-zinc-600 md:col-span-4">{dateTime.format(order.createdAt)} • {order.itemCount} itens</span>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] shadow-card backdrop-blur">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-lg font-bold text-white">Mais vendidos</h2>
          </div>
          <div className="divide-y divide-white/10">
            {data.topProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{product.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500"><ShoppingBag className="h-3 w-3" /> {product.quantity} vendidos</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-orange-300">{toMoney(product.revenue)}</p>
                  <AdminBadge variant={product.status}>{product.status}</AdminBadge>
                </div>
              </div>
            ))}
            {data.topProducts.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-zinc-500">
                <Star className="mx-auto mb-3 h-5 w-5 text-zinc-600" />
                Sem vendas registradas.
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  );
}

