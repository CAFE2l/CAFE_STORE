import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';
import type { CartItem, CartVariant } from '@/types';

type StoredCartItem = Partial<CartItem>;

function validVariants(variants: unknown): CartVariant[] | undefined {
  if (!Array.isArray(variants)) return undefined;

  const parsed = variants.filter(
    (variant): variant is CartVariant =>
      typeof variant === 'object' &&
      variant !== null &&
      typeof (variant as CartVariant).name === 'string' &&
      typeof (variant as CartVariant).value === 'string',
  );

  return parsed.length ? parsed : undefined;
}

/**
 * Cart records are a convenience cache, never a price source.  Product data is
 * rebuilt from the catalogue here so stale local/server entries cannot display
 * or submit a different unit price.
 */
async function canonicalizeCartItems(rawItems: unknown[]): Promise<CartItem[]> {
  const candidates = rawItems.filter(
    (item): item is StoredCartItem =>
      typeof item === 'object' && item !== null && typeof (item as StoredCartItem).productId === 'string',
  );
  const productIds = [...new Set(candidates.map((item) => item.productId!))];

  if (!productIds.length) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: ProductStatus.ACTIVE },
    select: { id: true, name: true, slug: true, price: true, stock: true, images: true },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  return candidates.flatMap((item) => {
    const product = productById.get(item.productId!);
    if (!product) return [];
    if (product.stock <= 0) return [];

    const quantity = Math.max(1, Math.min(Number.isFinite(item.quantity) ? Math.floor(item.quantity!) : 1, product.stock));

    return [{
      id: typeof item.id === 'string' && item.id ? item.id : product.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0] ?? '/placeholder-product.svg',
      price: product.price.toNumber(),
      quantity,
      stock: product.stock,
      variants: validVariants(item.variants),
    }];
  });
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ success: true, data: { items: [] } });
  }

  if (!process.env.DATABASE_URL) {
    return Response.json({ success: true, data: { items: [] } });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { cart: true },
  });

  const rawCart = user?.cart as { items?: unknown[] } | null;
  const items = await canonicalizeCartItems(rawCart?.items ?? []);

  // Also repair legacy cart JSON, so a corrected price/removal survives reloads.
  if (JSON.stringify(rawCart?.items ?? []) !== JSON.stringify(items)) {
    await prisma.user.update({ where: { id: session.user.id }, data: { cart: { items } } });
  }

  return Response.json({
    success: true,
    data: { items },
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ success: false, error: 'Nao autenticado.' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return Response.json({ success: false, error: 'Banco nao configurado.' }, { status: 503 });
  }

  const body: unknown = await request.json();
  const items = (body as { items?: unknown[] })?.items;

  if (!Array.isArray(items)) {
    return Response.json({ success: false, error: 'Dados invalidos.' }, { status: 400 });
  }

  const canonicalItems = await canonicalizeCartItems(items);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { cart: { items: canonicalItems } },
  });

  return Response.json({ success: true, data: { items: canonicalItems } });
}
