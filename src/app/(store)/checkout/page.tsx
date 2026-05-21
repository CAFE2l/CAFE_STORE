import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout | Cafe Store',
  description: 'Finalizacao de compra da Cafe Store.',
};

export default function CheckoutPage() {
  return <main className="container-page py-16">Checkout</main>;
}
