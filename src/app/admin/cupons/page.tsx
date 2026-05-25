import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminTable, EmptyPanel } from '@/components/admin/ui/AdminTable';
import { getCouponsPage } from '@/lib/admin/queries';
import { dateTime, toMoney } from '@/lib/admin/formatters';

export const dynamic = 'force-dynamic';

export default async function CuponsPage() {
  const coupons = await getCouponsPage();

  return (
    <SimplePage title="Cupons" description="Promoções, limites de uso e validade.">
      <AdminTable>
        {coupons.length ? (
          <div className="divide-y divide-white/10">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                <div>
                  <p className="font-mono font-bold text-white">{coupon.code}</p>
                  <p className="text-xs text-zinc-500">{coupon.type} • criado em {dateTime.format(coupon.createdAt)}</p>
                </div>
                <span className="text-sm text-orange-300">{coupon.type === 'FIXED' ? toMoney(coupon.discount.toNumber()) : `${coupon.discount.toNumber()}%`}</span>
                <span className="text-sm text-zinc-400">{coupon.usedCount}/{coupon.maxUses || '∞'} usos</span>
                <AdminBadge variant={coupon.active ? 'success' : 'muted'}>{coupon.active ? 'Ativo' : 'Inativo'}</AdminBadge>
              </div>
            ))}
          </div>
        ) : <EmptyPanel title="Nenhum cupom" description="Cupons criados no banco aparecerão nesta lista." />}
      </AdminTable>
    </SimplePage>
  );
}

function SimplePage({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <div className="grid gap-5"><header><h1 className="text-3xl font-black tracking-tight text-white">{title}</h1><p className="mt-2 text-sm text-zinc-500">{description}</p></header>{children}</div>;
}

