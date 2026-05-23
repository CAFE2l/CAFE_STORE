import { Prisma } from '@prisma/client';
import { getFingerprint } from '@/lib/feedbacks';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ success: false, error: 'Banco de dados indisponível.' }, { status: 503 });
  }

  try {
    const feedback = await prisma.$transaction(async (tx) => {
      await tx.feedbackHelpful.create({
        data: {
          feedbackId: params.id,
          fingerprint: getFingerprint(request),
        },
      });

      return tx.feedback.update({
        where: { id: params.id },
        data: { helpfulCount: { increment: 1 } },
        select: { helpfulCount: true },
      });
    });

    return Response.json({ success: true, data: { helpful_count: feedback.helpfulCount } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return Response.json({ success: false, error: 'Você já marcou este feedback como útil.' }, { status: 409 });
    }

    return Response.json({ success: false, error: 'Não foi possível registrar o voto.' }, { status: 400 });
  }
}
