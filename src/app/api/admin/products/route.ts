import { NextRequest, NextResponse } from 'next/server';
import { getProductsPage } from '@/lib/admin/queries';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const data = await getProductsPage(params);
  return NextResponse.json(data);
}

