import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OrdersPageClient } from '@/components/account/OrdersPageClient';
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
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 sm:py-12">
      <OrdersPageClient />
    </main>
  );
}
