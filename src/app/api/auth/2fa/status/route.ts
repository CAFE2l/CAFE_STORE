import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autorizado.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, twoFactorActivatedAt: true },
  });

  return Response.json({
    success: true,
    data: {
      enabled: user?.twoFactorEnabled ?? false,
      activatedAt: user?.twoFactorActivatedAt ?? null,
    },
  });
}
