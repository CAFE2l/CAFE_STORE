import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type BannerPayload = {
  title?: string;
  subtitle?: string | null;
  imageUrl?: string;
  linkUrl?: string | null;
  linkLabel?: string | null;
  position?: number;
  active?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

function toBannerData(body: BannerPayload) {
  return {
    title: String(body.title ?? '').trim(),
    subtitle: body.subtitle?.trim() || null,
    imageUrl: String(body.imageUrl ?? '').trim(),
    linkUrl: body.linkUrl?.trim() || null,
    linkLabel: body.linkLabel?.trim() || null,
    position: typeof body.position === 'number' ? body.position : undefined,
    active: typeof body.active === 'boolean' ? body.active : true,
    startsAt: body.startsAt ? new Date(body.startsAt) : null,
    endsAt: body.endsAt ? new Date(body.endsAt) : null,
  };
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  const banners = await prisma.banner.findMany({
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ success: true, data: banners });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  const data = toBannerData((await req.json()) as BannerPayload);
  if (!data.title || !data.imageUrl) {
    return NextResponse.json({ success: false, error: 'Titulo e imagem sao obrigatorios.' }, { status: 400 });
  }

  const maxPosition = await prisma.banner.aggregate({ _max: { position: true } });
  const banner = await prisma.banner.create({
    data: {
      ...data,
      position: data.position ?? (maxPosition._max.position ?? -1) + 1,
    },
  });

  return NextResponse.json({ success: true, data: banner }, { status: 201 });
}
