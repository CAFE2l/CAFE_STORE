import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { ProfileSidebar } from '@/components/account/ProfileSidebar';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function PerfilLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/perfil');
  }

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
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
