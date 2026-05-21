import type { Metadata } from 'next';

type AdminOrderPageProps = {
  params: {
    id: string;
  };
};

export function generateMetadata({ params }: AdminOrderPageProps): Metadata {
  return {
    title: `Pedido admin ${params.id} | Cafe Store`,
    description: 'Detalhe administrativo do pedido.',
  };
}

export default function AdminOrderPage({ params }: AdminOrderPageProps) {
  return <main className="container-page py-16">Pedido admin: {params.id}</main>;
}
