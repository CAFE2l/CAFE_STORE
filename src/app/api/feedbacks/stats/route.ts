import { getFeedbackStats } from '@/lib/feedbacks';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ success: true, data: await getFeedbackStats() });
}
