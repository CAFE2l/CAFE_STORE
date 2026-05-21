import type { Metadata } from 'next';

type EditProductPageProps = {
  params: {
    id: string;
  };
};

export function generateMetadata({ params }: EditProductPageProps): Metadata {
  return {
    title: `Editar produto ${params.id} | Cafe Store`,
    description: 'Edicao de produto da Cafe Store.',
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return <main className="container-page py-16">Editar produto: {params.id}</main>;
}
