import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin/dashboard');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-cafe-dark-900 lg:flex">
      <Sidebar />
      <main className="flex-1 p-5 lg:p-8">
        {children}
      </main>
    </div>
  );
}
