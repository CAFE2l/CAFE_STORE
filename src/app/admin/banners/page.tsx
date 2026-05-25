import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminTable, EmptyPanel } from '@/components/admin/ui/AdminTable';
import { toggleBannerAction } from '@/lib/admin/actions';
import { getBannersPage } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export default async function BannersPage() {
  const banners = await getBannersPage();

  return (
    <SimplePage title="Banners" description="Controle de vitrines, campanhas e ordem de exibição.">
      <AdminTable>
        {banners.length ? (
          <div className="divide-y divide-white/10">
            {banners.map((banner) => (
              <div key={banner.id} className="grid gap-3 px-5 py-4 md:grid-cols-[auto_1fr_auto_auto] md:items-center">
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-sm font-bold text-orange-300">{banner.position}</div>
                <div>
                  <p className="font-semibold text-white">{banner.title}</p>
                  <p className="text-xs text-zinc-500">{banner.subtitle ?? banner.linkUrl ?? 'Sem subtítulo'}</p>
                </div>
                <AdminBadge variant={banner.active ? 'success' : 'muted'}>{banner.active ? 'Ativo' : 'Inativo'}</AdminBadge>
                <form action={async () => { 'use server'; await toggleBannerAction(banner.id); }}>
                  <button className="h-9 rounded-lg border border-white/10 px-3 text-xs text-zinc-300 hover:bg-white/5">Alternar</button>
                </form>
              </div>
            ))}
          </div>
        ) : <EmptyPanel title="Nenhum banner" description="Banners cadastrados aparecerão aqui para curadoria." />}
      </AdminTable>
    </SimplePage>
  );
}

function SimplePage({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className="grid gap-5"><header><h1 className="text-3xl font-black tracking-tight text-white">{title}</h1><p className="mt-2 text-sm text-zinc-500">{description}</p></header>{children}</div>;
}

