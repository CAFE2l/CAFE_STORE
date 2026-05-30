import { Role } from '@prisma/client';
import { AdminFilters } from '@/components/admin/ui/AdminTable';
import { UsersAdminClient } from '@/components/admin/users-admin-client';
import { getUsersPage } from '@/lib/admin/queries';

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
      <UsersAdminClient data={data} basePath={basePath} />
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
