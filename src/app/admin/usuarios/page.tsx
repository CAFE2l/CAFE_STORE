import { Role } from '@prisma/client';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminFilters, AdminTable, EmptyPanel, Pagination } from '@/components/admin/ui/AdminTable';
import { getUsersPage } from '@/lib/admin/queries';
import { dateTime } from '@/lib/admin/formatters';

export const dynamic = 'force-dynamic';

export default async function UsuariosPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const data = await getUsersPage(searchParams);
  const basePath = `/admin/usuarios?${new URLSearchParams({ q: String(searchParams?.q ?? ''), role: String(searchParams?.role ?? 'all') }).toString()}`;

  return (
    <div className="grid gap-5">
      <PageHeader title="Usuários" description="Clientes e administradores vindos da tabela User." />
      <AdminFilters q={String(searchParams?.q ?? '')} status={String(searchParams?.role ?? 'all')} statusLabel="Perfil" options={[
        { label: 'Todos', value: 'all' },
        { label: 'Clientes', value: Role.CUSTOMER },
        { label: 'Admins', value: Role.ADMIN },
      ]} />
      <AdminTable>
        {data.items.length ? (
          <div className="divide-y divide-white/10">
            {data.items.map((user) => (
              <div key={user.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.4fr_1.2fr_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold text-white">{user.name ?? 'Cliente sem nome'}</p>
                  <p className="text-xs text-zinc-500">{user.email}</p>
                </div>
                <span className="text-sm text-zinc-400">{user.phone ?? 'Sem telefone'}</span>
                <AdminBadge variant={user.role}>{user.role}</AdminBadge>
                <span className="text-sm text-zinc-400">{user._count.orders} pedidos • {user._count.reviews} avaliações</span>
                <span className="text-xs text-zinc-600 md:col-span-4">Cadastro em {dateTime.format(user.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : <EmptyPanel title="Nenhum usuário encontrado" description="Ajuste a busca para localizar clientes cadastrados." />}
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

