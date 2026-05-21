import type { Metadata } from 'next';
import Link from 'next/link';
import { StatusBadge } from '@/components/account/StatusBadge';
import { getAdminDashboard } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'Admin | Cafe Store',
  description: 'Dashboard administrativo da Cafe Store.',
};

export const dynamic = 'force-dynamic';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboard();

  return (
    <main className="container-page grid gap-8 py-8">
      <h1 className="font-display text-4xl font-semibold text-text-primary">Dashboard da empresa</h1>
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Pedidos', dashboard.metrics.orders],
          ['Receita aprovada', currencyFormatter.format(dashboard.metrics.revenue)],
          ['Clientes', dashboard.metrics.customers],
          ['Produtos', dashboard.metrics.products],
        ].map(([label, value]) => (
          <article key={label} className="card p-5">
            <p className="text-sm text-text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{value}</p>
          </article>
        ))}
      </section>
      <section className="card p-5">
        <h2 className="font-display text-2xl font-semibold text-text-primary">Pedidos por dia</h2>
        <div className="mt-5 grid grid-cols-7 items-end gap-3">
          {dashboard.ordersByDay.map((day) => (
            <div key={day.date} className="grid gap-2 text-center">
              <div className="mx-auto flex h-28 w-full items-end rounded-xl bg-background-surface p-1">
                <span className="w-full rounded-lg bg-accent-primary" style={{ height: `${Math.max(8, day.total * 18)}px` }} />
              </div>
              <span className="text-xs text-text-muted">{day.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="card p-5">
        <h2 className="font-display text-2xl font-semibold text-text-primary">Pedidos recentes</h2>
        <div className="mt-5 grid gap-3">
          {dashboard.recentOrders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid gap-3 rounded-xl border border-white/10 p-4 md:grid-cols-4">
              <span className="font-mono text-sm text-text-primary">{order.id}</span>
              <span className="text-sm text-text-secondary">{order.user.name ?? order.user.email}</span>
              <StatusBadge status={order.status} />
              <span className="text-sm font-semibold text-text-primary">{currencyFormatter.format(order.total)}</span>
            </Link>
          ))}
          {dashboard.recentOrders.length === 0 ? <p className="text-sm text-text-secondary">Nenhum pedido ainda.</p> : null}
        </div>
      </section>
    </main>
  );
}
