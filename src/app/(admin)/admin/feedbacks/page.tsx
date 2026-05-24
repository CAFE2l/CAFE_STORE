import type { Metadata } from 'next';
import Link from 'next/link';
import { FeedbackModerationButtons, FeaturedServicesToggle } from '@/components/admin/forms/AdminActions';
import { Badge } from '@/components/ui/Badge';
import { getAdminFeedbacks } from '@/lib/admin';
import { feedbackServiceLabels } from '@/lib/feedbacks';

export const metadata: Metadata = {
  title: 'Feedbacks | Cafe Store',
  description: 'Moderação de feedbacks da CAFÉ Store.',
};

export const dynamic = 'force-dynamic';

export default async function AdminFeedbacksPage({ searchParams }: { searchParams?: { status?: string } }) {
  const status = searchParams?.status;
  const feedbacks = await getAdminFeedbacks(status);

  return (
    <main className="container-page grid gap-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold text-text-primary">Feedbacks</h1>
          <p className="mt-2 text-sm text-text-muted">Aprove, verifique e destaque depoimentos antes de aparecerem no site.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {[
            { href: '/admin/feedbacks', label: 'Todos' },
            { href: '/admin/feedbacks?status=pending', label: 'Pendentes' },
            { href: '/admin/feedbacks?status=approved', label: 'Aprovados' },
            { href: '/admin/feedbacks?status=featured', label: 'Destacados' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="rounded-button border border-border-subtle px-3 py-2 text-text-secondary transition hover:border-cafe-orange-500/40 hover:text-text-primary">
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <section className="grid gap-4">
        {feedbacks.map((feedback) => (
          <article key={feedback.id} className="card grid gap-4 p-5 xl:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-semibold text-text-primary">{feedback.authorName}</h2>
                <Badge variant={feedback.isApproved ? 'success' : 'muted'}>{feedback.isApproved ? 'Aprovado' : 'Pendente'}</Badge>
                {feedback.isVerified ? <Badge variant="success">Verificado</Badge> : null}
                {feedback.isFeatured ? <Badge variant="amber">Destaque</Badge> : null}
                <span className="text-xs text-text-muted">{feedbackServiceLabels[feedback.serviceType]}</span>
              </div>
              <p className="mt-2 text-sm text-accent-glow">{'★'.repeat(feedback.rating)}</p>
              <p className="mt-2 text-sm font-semibold text-text-primary">{feedback.title}</p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{feedback.body}</p>
              {feedback.resultMetric ? <p className="mt-3 text-sm font-medium text-cafe-orange-500">Resultado: {feedback.resultMetric}</p> : null}
              <p className="mt-3 text-xs text-text-muted">
                {feedback.authorEmail} · {feedback.createdAt.toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex flex-col items-end justify-between gap-3">
              <FeaturedServicesToggle id={feedback.id} isFeaturedServices={feedback.isFeaturedServices} order={feedback.featuredServicesOrder} />
              <FeedbackModerationButtons
                feedbackId={feedback.id}
                isApproved={feedback.isApproved}
                isVerified={feedback.isVerified}
                isFeatured={feedback.isFeatured}
              />
            </div>
          </article>
        ))}
        {feedbacks.length === 0 ? <p className="text-sm text-text-secondary">Nenhum feedback encontrado.</p> : null}
      </section>
    </main>
  );
}
