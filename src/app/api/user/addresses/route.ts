import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type AddressPayload = {
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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { id: 'desc' }],
  });

  return Response.json({ success: true, data: addresses });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const count = await prisma.address.count({ where: { userId: session.user.id } });
  if (count >= 5) {
    return Response.json({ success: false, error: 'Limite de 5 enderecos atingido.' }, { status: 400 });
  }

  const body = (await request.json()) as AddressPayload;
  if (!body.street || !body.number || !body.neighborhood || !body.city || !body.state || !body.zip) {
    return Response.json({ success: false, error: 'Preencha todos os campos obrigatorios.' }, { status: 400 });
  }

  const isDefault = body.isDefault ?? count === 0;
  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: body.label || null,
      street: body.street,
      number: body.number,
      complement: body.complement || null,
      neighborhood: body.neighborhood,
      city: body.city,
      state: body.state.toUpperCase(),
      zip: body.zip,
      isDefault,
    },
  });

  return Response.json({ success: true, data: address });
}
