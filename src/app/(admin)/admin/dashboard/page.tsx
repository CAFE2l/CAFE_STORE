import type { Metadata } from 'next';
import Link from 'next/link';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import { StatusBadge } from '@/components/account/StatusBadge';
import { getAdminDashboard } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'Dashboard | CAFÉ Admin',
  description: 'Dashboard administrativo da CAFÉ Store.',
};

export const dynamic = 'force-dynamic';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboard();

  const metrics = [
    { label: 'Vendas Hoje', value: currencyFormatter.format(dashboard.metrics.revenue), icon: DollarSign, change: '+12%' },
    { label: 'Pedidos Novos', value: dashboard.metrics.orders, icon: ShoppingCart, change: '+5%' },
    { label: 'Produtos Ativos', value: dashboard.metrics.products, icon: Package, change: '0%' },
    { label: 'Clientes Total', value: dashboard.metrics.customers, icon: Users, change: '+8%' },
  ];

  return (
    <main className="grid gap-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-text-muted">Visão geral do seu negócio.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.change.startsWith('+');
          return (
            <article key={metric.label} className="rounded-card border border-border-subtle bg-background-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-muted">{metric.label}</p>
                  <p className="mt-2 text-2xl font-bold text-text-primary">{metric.value}</p>
                </div>
                <span className="grid size-10 place-items-center rounded-lg bg-cafe-orange-500/10 text-cafe-orange-500">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className={`mt-3 text-xs font-medium ${isPositive ? 'text-status-success' : 'text-cafe-red-500'}`}>
                {metric.change} vs ontem
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-card border border-border-subtle bg-background-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-text-primary flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cafe-orange-500" />
            Pedidos por dia
          </h2>
        </div>
        <div className="mt-5 grid grid-cols-7 items-end gap-2">
          {dashboard.ordersByDay.map((day) => (
            <div key={day.date} className="grid gap-2 text-center">
              <div className="mx-auto flex h-28 w-full items-end rounded-lg bg-cafe-dark-700 p-1">
                <span className="w-full rounded-md bg-cafe-red-500 transition-all" style={{ height: `${Math.max(8, day.total * 18)}px` }} />
              </div>
              <span className="text-[10px] text-text-muted">{day.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-border-subtle bg-background-card p-5">
        <h2 className="font-display text-xl font-semibold text-text-primary mb-4">Pedidos recentes</h2>
        <div className="grid gap-3">
          {dashboard.recentOrders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid gap-3 rounded-lg border border-border-subtle bg-cafe-dark-700 p-4 transition hover:border-cafe-orange-500/40 md:grid-cols-4">
              <span className="font-mono text-sm text-text-primary">#{order.id.slice(0, 8)}</span>
              <span className="text-sm text-text-secondary">{order.user.name ?? order.user.email}</span>
              <StatusBadge status={order.status} />
              <span className="text-sm font-semibold text-cafe-orange-500">{currencyFormatter.format(order.total)}</span>
            </Link>
          ))}
          {dashboard.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">Nenhum pedido ainda.</p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
