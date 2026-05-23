import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProfileDashboardClient } from '@/components/account/ProfileDashboardClient';
import { ProfileSidebar } from '@/components/account/ProfileSidebar';
import { auth } from '@/lib/auth';
import { getProfile, getUserOrders } from '@/lib/account';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Perfil | Cafe Store',
  description: 'Dashboard do cliente com dados pessoais, pedidos, enderecos e favoritos.',
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/profile');
  }

  const [profile, orders] = await Promise.all([
    getProfile(session.user.id).catch(() => null),
    getUserOrders(session.user.id).catch(() => []),
  ]);
  const user = profile ?? session.user;

  const activeCoupons = await prisma.coupon
    .count({
      where: {
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
    })
    .catch(() => 0);

  return (
    <main className="container-page py-12">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-text-primary">Meu Perfil</h1>
        <p className="mt-1 text-sm text-text-muted">
          Dados pessoais, endereços, segurança, pedidos, favoritos e benefícios.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <ProfileSidebar />
        <div className="min-w-0 flex-1">
          <ProfileDashboardClient
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              phone: 'phone' in user ? user.phone : null,
              createdAt:
                'createdAt' in user && user.createdAt instanceof Date ? user.createdAt.toISOString() : null,
            }}
            addresses={(profile?.addresses ?? []).map((address) => ({
              id: address.id,
              label: address.label,
              street: address.street,
              number: address.number,
              complement: address.complement,
              neighborhood: address.neighborhood,
              city: address.city,
              state: address.state,
              zip: address.zip,
              isDefault: address.isDefault,
            }))}
            wishlist={(profile?.wishlist ?? []).map((item) => ({
              id: item.id,
              product: {
                id: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                images: item.product.images,
                price: item.product.price.toNumber(),
              },
            }))}
            orders={orders.map((order) => ({
              ...order,
              createdAt: order.createdAt.toISOString(),
            }))}
            activeCoupons={activeCoupons}
          />
        </div>
      </div>
    </main>
  );
}
