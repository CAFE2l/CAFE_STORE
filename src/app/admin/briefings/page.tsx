import { BriefingsTable } from '@/components/admin/briefings-table';
import { getBriefingsPage } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export default async function AdminBriefingsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const data = await getBriefingsPage(searchParams);
  const filters = {
    q: String(searchParams?.q ?? ''),
    status: String(searchParams?.status ?? 'all'),
  };

  const pending = data.counts.find((item) => item.status === 'PENDING')?.total ?? 0;
  const contacted = data.counts.find((item) => item.status === 'CONTACTED')?.total ?? 0;
  const approved = data.counts.find((item) => item.status === 'APPROVED')?.total ?? 0;

  return (
    <div className="grid gap-5">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Briefings</h1>
          <p className="mt-2 text-sm text-zinc-500">Briefings de projetos recebidos pelos serviços.</p>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Nesta visão', data.total],
          ['Pendentes', pending],
          ['Contatados', contacted],
          ['Aprovados', approved],
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-white/10 bg-white/[0.035] p-4 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-white">{value}</p>
          </article>
        ))}
      </section>

      <BriefingsTable briefings={data.items} filters={filters} />
    </div>
  );
}
