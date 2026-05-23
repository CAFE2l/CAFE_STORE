import { createHash } from 'crypto';
import { FeedbackService, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const feedbackServiceLabels: Record<FeedbackService, string> = {
  landing_page: 'Landing Page',
  site: 'Site Profissional',
  saas: 'SaaS',
  pacote_completo: 'Pacote Completo',
  outro: 'Outro',
};

export const feedbackServices = Object.keys(feedbackServiceLabels) as FeedbackService[];

export function serializeFeedback<T extends {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorAvatarUrl: string | null;
  authorCompany: string | null;
  authorRole: string | null;
  authorLinkedinUrl: string | null;
  serviceType: FeedbackService;
  rating: number;
  title: string;
  body: string;
  resultMetric: string | null;
  projectUrl: string | null;
  videoUrl: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}>(feedback: T) {
  return {
    id: feedback.id,
    author_name: feedback.authorName,
    author_email: feedback.authorEmail,
    author_avatar_url: feedback.authorAvatarUrl,
    author_company: feedback.authorCompany,
    author_role: feedback.authorRole,
    author_linkedin_url: feedback.authorLinkedinUrl,
    service_type: feedback.serviceType,
    service_label: feedbackServiceLabels[feedback.serviceType],
    rating: feedback.rating,
    title: feedback.title,
    body: feedback.body,
    result_metric: feedback.resultMetric,
    project_url: feedback.projectUrl,
    video_url: feedback.videoUrl,
    is_verified: feedback.isVerified,
    is_featured: feedback.isFeatured,
    is_approved: feedback.isApproved,
    helpful_count: feedback.helpfulCount,
    created_at: feedback.createdAt.toISOString(),
    updated_at: feedback.updatedAt.toISOString(),
  };
}

export function getFingerprint(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent') ?? 'unknown-agent';
  const ip = forwardedFor || realIp || 'unknown-ip';

  return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

export async function getFeedbackStats() {
  if (!process.env.DATABASE_URL) {
    return {
      totalApproved: 0,
      avgRating: 0,
      starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      starPercents: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      totalProjects: 0,
      recommendedPercent: 100,
    };
  }

  const [aggregate, groups, totalProjects] = await Promise.all([
    prisma.feedback.aggregate({
      where: { isApproved: true },
      _count: { _all: true },
      _avg: { rating: true },
    }),
    prisma.feedback.groupBy({
      by: ['rating'],
      where: { isApproved: true },
      _count: { rating: true },
    }),
    prisma.feedback.count({
      where: { isApproved: true, projectUrl: { not: null } },
    }),
  ]);

  const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const group of groups) {
    starCounts[group.rating as 1 | 2 | 3 | 4 | 5] = group._count.rating;
  }

  const totalApproved = aggregate._count._all;
  const starPercents = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const star of [1, 2, 3, 4, 5] as const) {
    starPercents[star] = totalApproved > 0 ? Math.round((starCounts[star] / totalApproved) * 100) : 0;
  }

  return {
    totalApproved,
    avgRating: Number((aggregate._avg.rating ?? 0).toFixed(1)),
    starCounts,
    starPercents,
    totalProjects,
    recommendedPercent: 100,
  };
}

export function getFeedbackOrder(sort: string | null): Prisma.FeedbackOrderByWithRelationInput[] {
  if (sort === 'rating') return [{ rating: 'desc' }, { createdAt: 'desc' }];
  if (sort === 'helpful') return [{ helpfulCount: 'desc' }, { createdAt: 'desc' }];
  return [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
}
