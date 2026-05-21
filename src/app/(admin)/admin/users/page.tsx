import type { Metadata } from 'next';
import { Badge } from '@/components/ui/Badge';
import { getAdminUsers } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'Usuarios | Cafe Store',
  description: 'Gestao de usuarios da Cafe Store.',
};

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <main className="container-page grid gap-6 py-8">
      <h1 className="font-display text-4xl font-semibold text-text-primary">Usuarios</h1>
      <section className="card overflow-hidden p-0">
        {users.map((user) => (
          <div key={user.id} className="grid gap-3 border-b border-border-subtle p-4 md:grid-cols-4">
            <span className="font-semibold text-text-primary">{user.name ?? 'Sem nome'}</span>
            <span className="text-sm text-text-secondary">{user.email}</span>
            <Badge variant={user.role === 'ADMIN' ? 'amber' : 'muted'}>{user.role}</Badge>
            <span className="text-sm text-text-secondary">{user._count.orders} pedidos</span>
          </div>
        ))}
        {users.length === 0 ? <p className="p-5 text-sm text-text-secondary">Nenhum usuario encontrado.</p> : null}
      </section>
    </main>
  );
}
