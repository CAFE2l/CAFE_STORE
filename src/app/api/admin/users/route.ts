import { NextRequest, NextResponse } from 'next/server';
import { getUsersPage } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const data = await getUsersPage(params);
  return NextResponse.json(data);
}

