import { Star } from 'lucide-react';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminTable, EmptyPanel } from '@/components/admin/ui/AdminTable';
import { approveReviewAction } from '@/lib/admin/actions';
import { getReviewsPage } from '@/lib/admin/queries';
import { dateTime } from '@/lib/admin/formatters';

export const dynamic = 'force-dynamic';

export default async function AvaliacoesPage() {
  const reviews = await getReviewsPage();

  return (
    <SimplePage title="Avaliações" description="Moderação de prova social e reviews de produtos.">
      <AdminTable>
        {reviews.length ? (
          <div className="divide-y divide-white/10">
            {reviews.map((review) => (
              <div key={review.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_1.4fr_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold text-white">{review.product.name}</p>
                  <p className="text-xs text-zinc-500">{review.user.name ?? review.user.email} • {dateTime.format(review.createdAt)}</p>
                </div>
                <p className="text-sm text-zinc-400">{review.comment ?? 'Sem comentário'}</p>
                <span className="flex items-center gap-1 text-sm text-yellow-200"><Star className="h-4 w-4 fill-yellow-200" /> {review.rating}</span>
                {review.approved ? (
                  <AdminBadge variant="success">Aprovada</AdminBadge>
                ) : (
                  <form action={async () => { 'use server'; await approveReviewAction(review.id); }}>
                    <button className="h-9 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white">Aprovar</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        ) : <EmptyPanel title="Nenhuma avaliação" description="Reviews de clientes aparecerão aqui." />}
      </AdminTable>
    </SimplePage>
  );
}

function SimplePage({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className="grid gap-5"><header><h1 className="text-3xl font-black tracking-tight text-white">{title}</h1><p className="mt-2 text-sm text-zinc-500">{description}</p></header>{children}</div>;
}

