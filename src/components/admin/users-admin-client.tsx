'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState, useTransition } from 'react';
import { Eye, Shield, Trash2, X } from 'lucide-react';
import type { Role } from '@prisma/client';
import { EmptyPanel, Pagination } from '@/components/admin/ui/AdminTable';
import { dateTime } from '@/lib/admin/formatters';
import { cn } from '@/lib/utils';

type UserItem = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  phone: string | null;
  createdAt: Date;
  orders: { id: string; status: string; total: number; createdAt: Date }[];
  reviews: { id: string; rating: number; comment: string | null; createdAt: Date; product: { name: string } }[];
  _count: { orders: number; reviews: number };
};

type UsersPageData = {
  items: UserItem[];
  page: number;
  pageSize: number;
  total: number;
};

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function UsersAdminClient({ data, basePath }: { data: UsersPageData; basePath: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<UserItem | null>(null);
  const [roleTarget, setRoleTarget] = useState<UserItem | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function refresh(messageText: string) {
    setMessage(messageText);
    setTimeout(() => setMessage(null), 3000);
    router.refresh();
  }

  function changeRole(user: UserItem) {
    const nextRole = user.role === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      const json = await res.json().catch(() => null);
      setRoleTarget(null);
      refresh(res.ok ? 'Perfil atualizado.' : json?.error ?? 'Erro ao alterar perfil.');
    });
  }

  function deleteUser(user: UserItem) {
    if (!window.confirm(`Excluir ${user.name ?? user.email}?`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      setSelected(null);
      refresh(res.ok ? 'Usuário excluído.' : json?.error ?? 'Erro ao excluir usuário.');
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25 shadow-card backdrop-blur">
      {message ? (
        <div className="border-b border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-zinc-200">{message}</div>
      ) : null}

      {data.items.length ? (
        <div className="divide-y divide-white/10">
          {data.items.map((user) => (
            <article key={user.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[1.6fr_220px_auto] xl:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar user={user} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold text-white">{user.name ?? 'Cliente sem nome'}</h2>
                    <RoleBadge role={user.role} />
                  </div>
                  <p className="truncate text-xs text-zinc-500">{user.email}</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Cadastro: {dateTime.format(new Date(user.createdAt))}
                    {user.phone ? ` • ${user.phone}` : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Stat label="pedidos" value={user._count.orders} />
                <Stat label="avaliações" value={user._count.reviews} />
              </div>

              <div className="flex gap-2 xl:justify-end">
                <ActionButton title="Ver detalhes" onClick={() => setSelected(user)}><Eye className="h-4 w-4" /></ActionButton>
                <ActionButton title="Alterar role" accent onClick={() => setRoleTarget(user)}><Shield className="h-4 w-4" /></ActionButton>
                <ActionButton title="Excluir usuário" danger onClick={() => deleteUser(user)}><Trash2 className="h-4 w-4" /></ActionButton>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyPanel title="Nenhum usuário encontrado" description="Ajuste a busca para localizar clientes cadastrados." />
      )}

      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} basePath={basePath} />

      {roleTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Alterar perfil</h2>
            <p className="mt-2 text-sm text-zinc-500">
              {roleTarget.role === 'ADMIN' ? 'Rebaixar para cliente?' : 'Promover para administrador?'}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-white/5" onClick={() => setRoleTarget(null)} disabled={pending}>Cancelar</button>
              <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60" onClick={() => changeRole(roleTarget)} disabled={pending}>Confirmar</button>
            </div>
          </div>
        </div>
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <aside className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-zinc-950 p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar user={selected} large />
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-white">{selected.name ?? 'Cliente sem nome'}</h2>
                  <p className="truncate text-sm text-zinc-500">{selected.email}</p>
                  <div className="mt-2"><RoleBadge role={selected.role} /></div>
                </div>
              </div>
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-400 hover:bg-white/5" onClick={() => setSelected(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid gap-2 text-sm text-zinc-400">
              <p>Telefone: {selected.phone ?? 'Sem telefone'}</p>
              <p>Cadastro: {dateTime.format(new Date(selected.createdAt))}</p>
            </div>

            <Section title="Últimos pedidos">
              {selected.orders.length ? selected.orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                  <span className="text-zinc-300">{order.status}</span>
                  <span className="text-zinc-500">{money.format(order.total)}</span>
                </div>
              )) : <p className="text-sm text-zinc-500">Sem pedidos recentes.</p>}
            </Section>

            <Section title="Últimas avaliações">
              {selected.reviews.length ? selected.reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                  <p className="text-orange-300">{'★'.repeat(review.rating)}</p>
                  <p className="mt-1 text-zinc-300">{review.product.name}</p>
                  {review.comment ? <p className="mt-1 text-zinc-500">{review.comment}</p> : null}
                </div>
              )) : <p className="text-sm text-zinc-500">Sem avaliações recentes.</p>}
            </Section>

            <div className="mt-6 flex flex-wrap gap-2">
              <button className="rounded-lg border border-orange-500/30 px-4 py-2 text-sm font-semibold text-orange-300 hover:bg-orange-500/10" onClick={() => setRoleTarget(selected)}>
                Promover/Rebaixar
              </button>
              <button className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10" onClick={() => deleteUser(selected)}>
                Excluir
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function Avatar({ user, large = false }: { user: UserItem; large?: boolean }) {
  const size = large ? 'h-16 w-16' : 'h-12 w-12';
  return (
    <div className={cn('relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-orange-500/15 text-sm font-bold text-orange-200', size)}>
      {user.image ? <Image src={user.image} alt={user.name ?? user.email} fill sizes={large ? '64px' : '48px'} className="object-cover" /> : user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase', role === 'ADMIN' ? 'border-orange-500/30 bg-orange-500/10 text-orange-300' : 'border-white/10 bg-white/[0.06] text-zinc-300')}>
      {role}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function ActionButton({ children, title, accent, danger, onClick }: { children: ReactNode; title: string; accent?: boolean; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.05] text-white/40 transition-all hover:bg-white/[0.10] hover:text-white',
        accent && 'hover:border-orange-500/30 hover:bg-orange-500/20 hover:text-orange-400',
        danger && 'hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-400',
      )}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-zinc-500">{title}</h3>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}
