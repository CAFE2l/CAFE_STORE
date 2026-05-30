import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { getBriefingsPage } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const data = await getBriefingsPage(params);
  return NextResponse.json(data);
}
