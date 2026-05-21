import type { Metadata } from 'next';

type OrderPageProps = {
  params: {
    id: string;
  };
};

export function generateMetadata({ params }: OrderPageProps): Metadata {
  return {
    title: `Pedido ${params.id} | Cafe Store`,
    description: 'Detalhes do pedido Cafe Store.',
  };
}

export default function OrderPage({ params }: OrderPageProps) {
  return <main className="container-page py-16">Pedido: {params.id}</main>;
}
