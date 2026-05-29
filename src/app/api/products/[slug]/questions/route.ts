import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const questions = await prisma.productQuestion.findMany({
      where: { productId: params.id },
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
  { params }: { params: { id: string } },
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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produto não encontrado.' },
        { status: 404 },
      );
    }

    const created = await prisma.productQuestion.create({
      data: {
        productId: params.id,
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
