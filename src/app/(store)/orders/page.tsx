import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OrdersPageClient } from '@/components/account/ProfileSectionPages';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Meus pedidos | Cafe Store',
  description: 'Historico de pedidos do cliente.',
};

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/orders');
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-12">
      <OrdersPageClient />
    </main>
  );
}
