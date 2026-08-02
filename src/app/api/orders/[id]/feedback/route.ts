import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: {
    id: string;
  };
};

function serialize(feedback: {
  id: string;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number;
  body: string;
  images: string[];
  videoUrl: string | null;
  createdAt: Date;
}) {
  return {
    id: feedback.id,
    authorName: feedback.authorName,
    authorAvatarUrl: feedback.authorAvatarUrl,
    rating: feedback.rating,
    body: feedback.body,
    images: feedback.images,
    videoUrl: feedback.videoUrl,
    createdAt: feedback.createdAt.toISOString(),
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Banco ainda nao configurado.' }, { status: 503 });
  }

  const feedbacks = await prisma.feedback
    .findMany({
      where: { orderId: params.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        authorName: true,
        authorAvatarUrl: true,
        rating: true,
        body: true,
        images: true,
        videoUrl: true,
        createdAt: true,
      },
    })
    .catch(() => []);

  return NextResponse.json({ success: true, data: feedbacks.map(serialize) });
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Nao autenticado.' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Banco ainda nao configurado.' }, { status: 503 });
  }

  const order = await prisma.order
    .findFirst({
      where: { id: params.id, userId: session.user.id },
      select: {
        id: true,
        items: { select: { productId: true }, take: 1 },
      },
    })
    .catch(() => null);

  if (!order) {
    return NextResponse.json({ success: false, error: 'Pedido nao encontrado.' }, { status: 404 });
  }

  const existing = await prisma.feedback.findFirst({
    where: { orderId: order.id, userId: session.user.id },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ success: false, error: 'Voce ja enviou feedback para este pedido.' }, { status: 409 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, error: 'Dados invalidos.' }, { status: 400 });
  }

  const data = body as { rating?: unknown; body?: unknown; images?: unknown; videoUrl?: unknown };

  const rating = Number(data.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ success: false, error: 'Avaliacao deve ser entre 1 e 5 estrelas.' }, { status: 400 });
  }

  const feedbackBody = typeof data.body === 'string' ? data.body.trim() : '';
  if (!feedbackBody || feedbackBody.length > 2000) {
    return NextResponse.json({ success: false, error: 'Escreva um feedback com ate 2000 caracteres.' }, { status: 400 });
  }

  const images = Array.isArray(data.images)
    ? data.images.filter((item): item is string => typeof item === 'string' && item.startsWith('http')).slice(0, 4)
    : [];
  const videoUrl = typeof data.videoUrl === 'string' && data.videoUrl.startsWith('http') ? data.videoUrl : null;

  const feedback = await prisma.feedback.create({
    data: {
      authorName: session.user.name ?? session.user.email ?? 'Cliente',
      authorEmail: session.user.email ?? '',
      authorAvatarUrl: session.user.image,
      userId: session.user.id,
      serviceType: 'outro',
      source: 'pedido',
      rating,
      title: 'Feedback do pedido',
      body: feedbackBody,
      productId: order.items[0]?.productId ?? null,
      orderId: order.id,
      images,
      videoUrl,
    },
    select: {
      id: true,
      authorName: true,
      authorAvatarUrl: true,
      rating: true,
      body: true,
      images: true,
      videoUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, data: serialize(feedback) }, { status: 201 });
}
