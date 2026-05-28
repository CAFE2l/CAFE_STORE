import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }

  const [favorite] = await prisma.$transaction([
    prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {},
      create: { userId: session.user.id, productId },
    }),
    prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {},
      create: { userId: session.user.id, productId },
    }),
  ]);

  return NextResponse.json(favorite);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.wishlist.deleteMany({
      where: { userId: session.user.id, productId },
    }),
    prisma.favorite.deleteMany({
      where: { userId: session.user.id, productId },
    }),
  ]);

  return NextResponse.json({ success: true });
}
