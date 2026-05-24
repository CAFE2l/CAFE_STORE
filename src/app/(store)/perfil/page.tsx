import type { Metadata } from 'next';
import { ProfileDashboardClient } from '@/components/account/ProfileDashboardClient';
import { auth } from '@/lib/auth';
import { getProfile, getUserOrders } from '@/lib/account';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Meu Perfil | Cafe Store',
  description: 'Dados pessoais do cliente Cafe Store.',
};

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
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
    <ProfileDashboardClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        phone: 'phone' in user ? user.phone : null,
        createdAt: 'createdAt' in user && user.createdAt instanceof Date ? user.createdAt.toISOString() : null,
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
  );
}
