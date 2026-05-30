import { NextRequest, NextResponse } from 'next/server';
import { ProductStatus } from '@prisma/client';
import { requireAdmin } from '@/lib/admin';
import { getProductsPage } from '@/lib/admin/queries';
import { prisma } from '@/lib/prisma';
import { generateSku, sanitizeSku } from '@/lib/sku';
import { adminProductSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const data = await getProductsPage(params);
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ success: false, error: 'Banco Neon ainda nao configurado.' }, { status: 503 });

  const parsed = adminProductSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      sku: sanitizeSku(parsed.data.sku) || generateSku(parsed.data.name),
      description: parsed.data.description || null,
      oldPrice: parsed.data.oldPrice ?? null,
      variants: parsed.data.variants ?? undefined,
      status: parsed.data.status as ProductStatus,
    },
  });

  return NextResponse.json({ success: true, data: product });
}
