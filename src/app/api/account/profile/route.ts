import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string; phone?: string };

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.phone !== undefined && { phone: body.phone }),
    },
    select: { id: true, name: true, email: true, image: true, phone: true, createdAt: true },
  });

  return NextResponse.json({ success: true, user });
}
