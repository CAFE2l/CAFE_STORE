import { BannersAdminClient } from '@/components/admin/banners/BannersAdminClient';
import { getBannersPage } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export default async function BannersPage() {
  const banners = await getBannersPage();

  return <BannersAdminClient initialBanners={banners.map((banner) => ({
    ...banner,
    startsAt: banner.startsAt?.toISOString() ?? null,
    endsAt: banner.endsAt?.toISOString() ?? null,
    createdAt: banner.createdAt.toISOString(),
    updatedAt: banner.updatedAt.toISOString(),
  }))} />;
}
