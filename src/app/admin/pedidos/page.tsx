import { OrderStatus } from '@prisma/client';
import { OrderStatusSelect } from '@/components/admin/forms/AdminActions';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminFilters, AdminTable, EmptyPanel, Pagination } from '@/components/admin/ui/AdminTable';
import { getOrdersPage } from '@/lib/admin/queries';
import { dateTime, toMoney } from '@/lib/admin/formatters';

export const dynamic = 'force-dynamic';

export default async function PedidosPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const data = await getOrdersPage(searchParams);
  const basePath = `/admin/pedidos?${new URLSearchParams({ q: String(searchParams?.q ?? ''), status: String(searchParams?.status ?? 'all') }).toString()}`;

  return (
    <div className="grid gap-5">
      <PageHeader title="Pedidos" description="Operação comercial com busca por cliente, ID, status e paginação." />
      <AdminFilters q={String(searchParams?.q ?? '')} status={String(searchParams?.status ?? 'all')} options={[
        { label: 'Todos', value: 'all' },
        { label: 'Pendentes', value: OrderStatus.PENDING },
        { label: 'Agendados', value: OrderStatus.SCHEDULED },
        { label: 'Processando', value: OrderStatus.PROCESSING },
        { label: 'Enviados', value: OrderStatus.SHIPPED },
        { label: 'Entregues', value: OrderStatus.DELIVERED },
        { label: 'Cancelados', value: OrderStatus.CANCELLED },
      ]} />
      <AdminTable>
        {data.items.length ? (
          <div className="divide-y divide-white/10">
            {data.items.map((order) => (
              <div key={order.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1.4fr_auto_auto_auto_auto] md:items-center">
                <span className="font-mono text-sm text-zinc-300">#{order.id.slice(0, 10)}</span>
                <div>
                  <p className="text-sm font-medium text-white">{order.user.name ?? order.user.email}</p>
                  <p className="text-xs text-zinc-500">{dateTime.format(order.createdAt)}</p>
                </div>
                <AdminBadge variant={order.status}>{order.status}</AdminBadge>
                <OrderStatusSelect orderId={order.id} status={order.status} />
                <span className="text-sm text-zinc-400">{order.itemCount} itens</span>
                <span className="text-sm font-bold text-orange-300">{toMoney(order.total)}</span>
              </div>
            ))}
          </div>
        ) : <EmptyPanel title="Nenhum pedido encontrado" description="Pedidos aparecerão aqui assim que o checkout criar registros no banco." />}
        <Pagination page={data.page} pageSize={data.pageSize} total={data.total} basePath={basePath} />
      </AdminTable>
    </div>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </header>
  );
}
