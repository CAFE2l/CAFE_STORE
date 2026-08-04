import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const questions = await prisma.productQuestion.findMany({
      where: { productId: params.slug },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        authorName: true,
        question: true,
        answer: true,
        answeredAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: questions });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar perguntas.' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Faça login para enviar uma pergunta.' },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { question: string };
    const { question } = body;

    if (!question || question.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'A pergunta deve ter pelo menos 2 caracteres.' },
        { status: 400 },
      );
    }

    // The catalogue falls back to hardcoded "symbolic support" products whose
    // ids (e.g. `prod-moletom-limited`) are not rows in the database, so do not
    // gate the create on a DB product lookup.
    const created = await prisma.productQuestion.create({
      data: {
        productId: params.slug,
        userId: session.user.id,
        authorName: session.user.name ?? 'Anônimo',
        question: question.trim(),
      },
      select: {
        id: true,
        authorName: true,
        question: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao enviar pergunta.' },
      { status: 500 },
    );
  }
}
