import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const body = (await request.json()) as {
    label?: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
    isDefault?: boolean;
  };

  if (!body.street || !body.number || !body.neighborhood || !body.city || !body.state || !body.zip) {
    return NextResponse.json({ success: false, error: 'Preencha todos os campos obrigatorios.' }, { status: 400 });
  }

  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: body.label ?? null,
      street: body.street,
      number: body.number,
      complement: body.complement ?? null,
      neighborhood: body.neighborhood,
      city: body.city,
      state: body.state,
      zip: body.zip,
      isDefault: body.isDefault ?? false,
    },
  });

  return NextResponse.json({ success: true, address });
}
