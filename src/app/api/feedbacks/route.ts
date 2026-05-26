import { FeedbackService } from '@prisma/client';
import { z } from 'zod';
import { sendFeedbackAdminEmail, sendFeedbackReceivedEmail } from '@/lib/email';
import { feedbackServiceLabels, feedbackServices, getFeedbackOrder, serializeFeedback } from '@/lib/feedbacks';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const createFeedbackSchema = z.object({
  author_name: z.string().trim().min(2).max(100),
  author_email: z.string().trim().email().max(255),
  author_company: z.string().trim().max(100).optional().or(z.literal('')),
  author_linkedin_url: z.string().trim().url().optional().or(z.literal('')),
  service_type: z.nativeEnum(FeedbackService),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(6).max(150),
  body: z.string().trim().min(80).max(4000),
  result_metric: z.string().trim().max(200).optional().or(z.literal('')),
  project_url: z.string().trim().url().optional().or(z.literal('')),
  video_url: z.string().trim().url().optional().or(z.literal('')),
  consent: z.literal(true),
});

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ success: true, data: { feedbacks: [], nextCursor: null } });
  }

  const { searchParams } = new URL(request.url);
  const service = searchParams.get('service') as FeedbackService | null;
  const cursor = searchParams.get('cursor');
  const sort = searchParams.get('sort');
  const limit = Math.min(Number(searchParams.get('limit') ?? 9), 24);

  const feedbacks = await prisma.feedback.findMany({
    where: {
      isApproved: true,
      ...(service && feedbackServices.includes(service) ? { serviceType: service } : {}),
    },
    orderBy: getFeedbackOrder(sort),
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasNext = feedbacks.length > limit;
  const page = hasNext ? feedbacks.slice(0, limit) : feedbacks;

  return Response.json({
    success: true,
    data: {
      feedbacks: page.map(serializeFeedback),
      nextCursor: hasNext ? page[page.length - 1]?.id ?? null : null,
    },
  });
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ success: false, error: 'Banco de dados indisponível.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createFeedbackSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ success: false, error: 'Revise os campos do feedback.' }, { status: 400 });
  }

  const data = parsed.data;
  const feedback = await prisma.feedback.create({
    data: {
      authorName: data.author_name,
      authorEmail: data.author_email,
      authorCompany: data.author_company || null,
      authorLinkedinUrl: data.author_linkedin_url || null,
      serviceType: data.service_type,
      rating: data.rating,
      title: data.title,
      body: data.body,
      resultMetric: data.result_metric || null,
      projectUrl: data.project_url || null,
      videoUrl: data.video_url || null,
    },
  });

  await Promise.allSettled([
    sendFeedbackAdminEmail({
      authorName: data.author_name,
      authorEmail: data.author_email,
      serviceLabel: feedbackServiceLabels[data.service_type],
      rating: data.rating,
      title: data.title,
      body: data.body,
    }),
    sendFeedbackReceivedEmail({ authorName: data.author_name, authorEmail: data.author_email }),
  ]);

  return Response.json({ success: true, data: serializeFeedback(feedback) }, { status: 201 });
}
