import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const existing = await prisma.address.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!existing) {
    return Response.json({ success: false, error: 'Endereco nao encontrado.' }, { status: 404 });
  }

  await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } });
  const address = await prisma.address.update({ where: { id: params.id }, data: { isDefault: true } });

  return Response.json({ success: true, data: address });
}
