import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Servicos | Cafe Store',
  description: 'Servicos premium da Cafe Store.',
};

export default function ServicesPage() {
  return <main className="container-page py-16">Servicos</main>;
}
