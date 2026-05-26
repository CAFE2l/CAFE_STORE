import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { serializeFeedback } from '@/lib/feedbacks'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        isApproved: true,
        isFeaturedServices: true,
      },
      orderBy: { featuredServicesOrder: 'asc' },
    })

    return NextResponse.json({ success: true, feedbacks: feedbacks.map(serializeFeedback) })
  } catch (err) {
    console.error('Erro ao buscar feedbacks em destaque (services):', err)
    return NextResponse.json({ success: true, feedbacks: [] })
  }
}