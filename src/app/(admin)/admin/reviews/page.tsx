import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Avaliacoes | Cafe Store',
  description: 'Moderacao de avaliacoes da Cafe Store.',
};

export default function AdminReviewsPage() {
  return <main className="container-page py-16">Avaliacoes</main>;
}
