import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Novo produto | Cafe Store',
  description: 'Cadastro de produto da Cafe Store.',
};

export default function NewProductPage() {
  return <main className="container-page py-16">Novo produto</main>;
}
