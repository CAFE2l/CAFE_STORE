import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const existing = await prisma.address.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!existing) {
    return Response.json({ success: false, error: 'Endereco nao encontrado.' }, { status: 404 });
  }

  const body = await request.json();
  const address = await prisma.address.update({
    where: { id: params.id },
    data: {
      label: body.label || null,
      street: body.street,
      number: body.number,
      complement: body.complement || null,
      neighborhood: body.neighborhood,
      city: body.city,
      state: String(body.state ?? '').toUpperCase(),
      zip: body.zip,
    },
  });

  return Response.json({ success: true, data: address });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const existing = await prisma.address.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!existing) {
    return Response.json({ success: false, error: 'Endereco nao encontrado.' }, { status: 404 });
  }

  await prisma.address.delete({ where: { id: params.id } });
  return Response.json({ success: true });
}
