import type { Metadata } from 'next';
import { CheckoutPageClient } from '@/components/store/CheckoutPageClient';

export const metadata: Metadata = {
  title: 'Checkout | Cafe Store',
  description: 'Finalizacao de compra da Cafe Store.',
};

export default function CheckoutPage() {
  return (
    <div className="relative min-h-screen bg-[#080808]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-60 top-10 h-[600px] w-[600px] rounded-full bg-orange-500/[0.04] blur-[140px]" />
        <div className="absolute -right-60 bottom-10 h-[500px] w-[500px] rounded-full bg-orange-600/[0.03] blur-[120px]" />
      </div>
      <main className="relative mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Checkout</h1>
          <p className="mt-1 text-sm text-white/40">Finalize sua compra em etapas.</p>
          <div className="mt-4 h-0.5 w-full max-w-xs bg-gradient-to-r from-orange-500 via-orange-500/60 to-transparent" />
        </div>
        <CheckoutPageClient />
      </main>
    </div>
  );
}
