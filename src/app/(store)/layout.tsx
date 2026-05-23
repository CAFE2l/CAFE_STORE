import type { ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Providers } from '@/components/Providers';

type StoreLayoutProps = {
  children: ReactNode;
};

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <Providers>
      <div className="flex min-h-screen flex-col bg-cafe-dark-900">
        <Header />
        <div className="flex-1 animate-fade-up">{children}</div>
        <Footer />
      </div>
    </Providers>
  );
}
