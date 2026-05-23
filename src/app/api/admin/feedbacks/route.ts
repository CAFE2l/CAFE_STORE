import { getAdminFeedbacks, requireAdmin } from '@/lib/admin';
import { serializeFeedback } from '@/lib/feedbacks';

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ success: false, error: 'Acesso negado.' }, { status: 403 });

  const status = new URL(request.url).searchParams.get('status') ?? undefined;
  const feedbacks = await getAdminFeedbacks(status);

  return Response.json({ success: true, data: feedbacks.map(serializeFeedback) });
}
