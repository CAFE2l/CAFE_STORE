import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { auth } from '@/lib/auth';
import { getProfile } from '@/lib/account';

export const metadata: Metadata = {
  title: 'Perfil | Cafe Store',
  description: 'Perfil e dados do cliente.',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/profile');
  }

  const profile = await getProfile(session.user.id);
  const user = profile ?? session.user;
  const addresses = profile?.addresses ?? [];
  const wishlist = profile?.wishlist ?? [];

  return (
    <main className="container-page grid gap-8 py-12">
      <div>
        <h1 className="font-display text-4xl font-semibold text-text-primary">Perfil</h1>
        <p className="mt-3 text-sm text-text-secondary">Dados pessoais, enderecos salvos e favoritos.</p>
      </div>

      <section className="glass grid gap-5 rounded-2xl p-6 shadow-warm md:grid-cols-[auto_1fr]">
        {user.image ? (
          <Image src={user.image} alt={user.name ?? 'Perfil'} width={96} height={96} className="rounded-full" />
        ) : (
          <div className="grid size-24 place-items-center rounded-full bg-accent-primary/10 text-3xl font-semibold text-accent-primary">
            {(user.name ?? user.email ?? 'U').slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="font-display text-2xl font-semibold text-text-primary">{user.name ?? 'Cliente Cafe Store'}</h2>
          <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
          <p className="mt-3 text-sm text-text-muted">
            {profile?.phone ? `Telefone: ${profile.phone}` : 'Telefone ainda nao cadastrado.'}
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-2xl font-semibold text-text-primary">Enderecos</h2>
          {addresses.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {addresses.map((address) => (
                <article key={address.id} className="rounded-xl border border-white/10 p-4 text-sm text-text-secondary">
                  <p className="font-semibold text-text-primary">{address.label ?? 'Endereco'}</p>
                  <p className="mt-2">
                    {address.street}, {address.number} - {address.neighborhood}
                  </p>
                  <p>
                    {address.city}/{address.state} - {address.zip}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-secondary">Nenhum endereco salvo ainda.</p>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-display text-2xl font-semibold text-text-primary">Seguranca</h2>
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            A troca de senha sera ligada ao fluxo de configuracoes no proximo refinamento de conta.
          </p>
          <Link href="/orders" className="btn-secondary mt-5 inline-flex">
            Ver pedidos
          </Link>
        </div>
      </section>

      <section className="grid gap-5">
        <h2 className="font-display text-2xl font-semibold text-text-primary">Lista de desejo</h2>
        {wishlist.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {wishlist.map((item) => (
              <Link key={item.id} href={`/products/${item.product.slug}`} className="card p-4">
                <p className="font-semibold text-text-primary">{item.product.name}</p>
                <p className="mt-2 text-sm text-text-secondary">Favorito</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum favorito"
            subtitle="Favorite produtos na vitrine para encontrar rapidamente depois."
            action={{ href: '/products', label: 'Ver produtos' }}
          />
        )}
      </section>
    </main>
  );
}
