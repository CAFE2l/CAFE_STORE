import type { Metadata } from 'next';
import Link from 'next/link';
import { ReviewModerationButtons } from '@/components/admin/forms/AdminActions';
import { Badge } from '@/components/ui/Badge';
import { getAdminReviews } from '@/lib/admin';

export const metadata: Metadata = {
  title: 'Avaliacoes | Cafe Store',
  description: 'Moderacao de avaliacoes da Cafe Store.',
};

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();

  return (
    <main className="container-page grid gap-6 py-8">
      <h1 className="font-display text-4xl font-semibold text-text-primary">Avaliacoes</h1>
      <section className="grid gap-4">
        {reviews.map((review) => (
          <article key={review.id} className="card grid gap-4 p-5 md:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/products/${review.product.slug}`} className="font-semibold text-text-primary hover:text-accent-glow">
                  {review.product.name}
                </Link>
                <Badge variant={review.approved ? 'success' : 'muted'}>{review.approved ? 'Aprovada' : 'Pendente'}</Badge>
              </div>
              <p className="mt-2 text-sm text-accent-glow">{'★'.repeat(review.rating)}</p>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{review.comment ?? 'Sem comentario.'}</p>
              <p className="mt-3 text-xs text-text-muted">{review.user.name ?? review.user.email}</p>
            </div>
            <ReviewModerationButtons reviewId={review.id} />
          </article>
        ))}
        {reviews.length === 0 ? <p className="text-sm text-text-secondary">Nenhuma avaliacao encontrada.</p> : null}
      </section>
    </main>
  );
}
