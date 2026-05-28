import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type BannerRouteProps = {
  params: { id: string };
};

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
    title: body.title?.trim(),
    subtitle: body.subtitle?.trim() || null,
    imageUrl: body.imageUrl?.trim(),
    linkUrl: body.linkUrl?.trim() || null,
    linkLabel: body.linkLabel?.trim() || null,
    position: typeof body.position === 'number' ? body.position : undefined,
    active: typeof body.active === 'boolean' ? body.active : undefined,
    startsAt: body.startsAt ? new Date(body.startsAt) : null,
    endsAt: body.endsAt ? new Date(body.endsAt) : null,
  };
}

export async function PUT(req: Request, { params }: BannerRouteProps) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  const data = toBannerData((await req.json()) as BannerPayload);
  if (!data.title || !data.imageUrl) {
    return NextResponse.json({ success: false, error: 'Titulo e imagem sao obrigatorios.' }, { status: 400 });
  }

  const banner = await prisma.banner.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ success: true, data: banner });
}

export async function DELETE(_req: Request, { params }: BannerRouteProps) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  await prisma.banner.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
