import { FeedbackService } from '@prisma/client';
import { z } from 'zod';
import { sendFeedbackAdminEmail, sendFeedbackReceivedEmail } from '@/lib/email';
import { feedbackServiceLabels, feedbackServices, getFeedbackOrder, serializeFeedback } from '@/lib/feedbacks';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type FeedbackPayload = Record<string, unknown>;

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
};

const optionalText = (max: number) => z.preprocess(emptyStringToUndefined, z.string().trim().max(max).optional());

const optionalUrl = z.preprocess(emptyStringToUndefined, z.string().trim().url().max(2048).optional());

const requiredConsent = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return value;

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'on', 'yes', 'sim'].includes(normalized)) return true;
  if (['false', '0', 'off', 'no', 'nao', 'não'].includes(normalized)) return false;

  return value;
}, z.literal(true));

const createFeedbackSchema = z.object({
  author_name: z.string().trim().min(2).max(100),
  author_email: z.string().trim().email().max(255),
  author_company: optionalText(100),
  author_linkedin_url: optionalUrl,
  service_type: z.nativeEnum(FeedbackService),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(6).max(150),
  body: z.string().trim().min(80).max(4000),
  result_metric: optionalText(200),
  project_url: optionalUrl,
  video_url: optionalUrl,
  consent: requiredConsent,
});

function getStringAlias(payload: FeedbackPayload, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string') return value;
  }

  return undefined;
}

function normalizeFeedbackBody(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return body;

  const payload = body as FeedbackPayload;

  return {
    ...payload,
    body: getStringAlias(payload, ['body', 'depoimento', 'testimonial']) ?? payload.body,
    title: getStringAlias(payload, ['title', 'titulo']) ?? payload.title,
    result_metric: getStringAlias(payload, ['result_metric', 'resultado', 'concrete_result']) ?? payload.result_metric,
    project_url: getStringAlias(payload, ['project_url', 'projectUrl', 'urlProjeto']) ?? payload.project_url,
    consent: payload.consent ?? payload.authorized_publication,
  };
}

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

  if (process.env.NODE_ENV !== 'production') {
    console.log('[POST /api/feedbacks] body recebido:', JSON.stringify(body, null, 2));
    console.log(
      '[POST /api/feedbacks] typeof authorized:',
      typeof (body && typeof body === 'object' && !Array.isArray(body) ? (body as FeedbackPayload).authorized_publication : undefined),
    );
  }

  const parsed = createFeedbackSchema.safeParse(normalizeFeedbackBody(body));

  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: 'Revise os campos do feedback.',
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const feedback = await prisma.feedback.create({
    data: {
      authorName: data.author_name,
      authorEmail: data.author_email,
      authorCompany: data.author_company ?? null,
      authorLinkedinUrl: data.author_linkedin_url ?? null,
      serviceType: data.service_type,
      rating: data.rating,
      title: data.title,
      body: data.body,
      resultMetric: data.result_metric ?? null,
      projectUrl: data.project_url ?? null,
      videoUrl: data.video_url ?? null,
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
