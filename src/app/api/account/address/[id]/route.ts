import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const address = await prisma.address.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!address) {
    return NextResponse.json({ success: false, error: 'Endereco nao encontrado.' }, { status: 404 });
  }

  const body = (await request.json()) as {
    label?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip?: string;
    isDefault?: boolean;
  };

  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.address.update({
    where: { id: params.id },
    data: {
      ...(body.label !== undefined && { label: body.label }),
      ...(body.street !== undefined && { street: body.street }),
      ...(body.number !== undefined && { number: body.number }),
      ...(body.complement !== undefined && { complement: body.complement }),
      ...(body.neighborhood !== undefined && { neighborhood: body.neighborhood }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.state !== undefined && { state: body.state }),
      ...(body.zip !== undefined && { zip: body.zip }),
      ...(body.isDefault !== undefined && { isDefault: body.isDefault }),
    },
  });

  return NextResponse.json({ success: true, address: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const address = await prisma.address.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!address) {
    return NextResponse.json({ success: false, error: 'Endereco nao encontrado.' }, { status: 404 });
  }

  await prisma.address.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
