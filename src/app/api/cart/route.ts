import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ success: true, data: { items: [] } });
  }

  if (!process.env.DATABASE_URL) {
    return Response.json({ success: true, data: { items: [] } });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { cart: true },
  });

  const rawCart = user?.cart as { items?: unknown[] } | null;
  return Response.json({
    success: true,
    data: { items: rawCart?.items ?? [] },
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autenticado.' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return Response.json({ success: false, error: 'Banco nao configurado.' }, { status: 503 });
  }

  const body = await request.json();
  const items = body.items as unknown[];

  if (!Array.isArray(items)) {
    return Response.json({ success: false, error: 'Dados invalidos.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { cart: JSON.parse(JSON.stringify(body)) },
  });

  return Response.json({ success: true, data: { items } });
}
