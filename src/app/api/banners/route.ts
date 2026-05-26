import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({ success: true, data: [] });
  }

  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { position: 'asc' },
    select: {
      id: true,
      title: true,
      subtitle: true,
      imageUrl: true,
      linkUrl: true,
    },
  });

  return Response.json({ success: true, data: banners });
}
