import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  price: number;
  oldPrice: number | null;
  stock: number;
  images: string[];
  status: ProductStatus;
  featured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  reviewCount: number;
  averageRating: number;
};

export type ProductDetail = ProductListItem & {
  variants: Prisma.JsonValue;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    images: string[];
    videoUrl: string | null;
    verifiedPurchase: boolean;
    createdAt: Date;
    user: {
      name: string | null;
      image: string | null;
    };
  }[];
};

export type ProductFilters = {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  featured?: boolean;
};

export type PaginatedProducts = {
  products: ProductListItem[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

const fallbackCategories = [
  { id: 'cat-camisetas', name: 'Camisetas', slug: 'camisetas', image: null },
  { id: 'cat-canecas', name: 'Canecas', slug: 'canecas', image: null },
  { id: 'cat-moletons', name: 'Moletons', slug: 'moletons', image: null },
  { id: 'cat-acessorios', name: 'Acessorios', slug: 'acessorios', image: null },
];

const fallbackProducts: ProductListItem[] = [
  {
    id: 'prod-camiseta-algodao',
    name: 'Camisa Normal Café Store',
    slug: 'camiseta-algodao-cafe-store',
    sku: 'CAF-CAM-ALG-000001',
    description:
      'Apoio simbolico com imagem ilustrativa de camiseta CAFÉ. Nao e produto fisico, nao gera envio e funciona apenas como doacao ao projeto.',
    price: 9.9,
    oldPrice: 19.9,
    stock: 40,
    images: [
      '/images/produtos/camisa_normal/preta/banner.png',
      '/images/produtos/camisa_normal/preta/design.jpeg',
      '/images/produtos/camisa_normal/preta/camisaVtirine.png',
      '/images/produtos/camisa_normal/preta/camisa_tras.png',
      '/images/produtos/camisa_normal/branca/banner.png',
      '/images/produtos/camisa_normal/branca/design.jpeg',
      '/images/produtos/camisa_normal/branca/frente.jpeg',
      '/images/produtos/camisa_normal/branca/tras.jpeg',
    ],
    status: ProductStatus.ACTIVE,
    featured: true,
    category: fallbackCategories[0],
    reviewCount: 0,
    averageRating: 0,
  },
  {
    id: 'prod-tech-tee',
    name: 'Camisa Poliéster Café Store',
    slug: 'tech-tee-dry-pro-cafe-store',
    sku: 'CAF-TEC-TEE-000002',
    description:
      'Apoio simbolico com imagem ilustrativa de camisa poliester CAFÉ. Nao e produto fisico, nao gera envio e funciona apenas como doacao ao projeto.',
    price: 12.9,
    oldPrice: 24.9,
    stock: 28,
    images: [
      '/images/produtos/poliester/preta/camisa_poliester.png',
      '/images/produtos/poliester/preta/design.png',
      '/images/produtos/poliester/preta/frente.jpeg',
      '/images/produtos/poliester/preta/tras.png',
      '/images/produtos/poliester/branca/banner.jpeg',
      '/images/produtos/poliester/branca/design.jpeg',
      '/images/produtos/poliester/branca/frente.jpeg',
      '/images/produtos/poliester/branca/tras.jpeg',
    ],
    status: ProductStatus.ACTIVE,
    featured: true,
    category: fallbackCategories[0],
    reviewCount: 0,
    averageRating: 0,
  },
  {
    id: 'prod-moletom-limited',
    name: 'Moletom Edição Limitada Café Store',
    slug: 'moletom-limited-edition-cafe-store',
    sku: 'CAF-MOL-LIM-000003',
    description:
      'Apoio simbolico com imagem ilustrativa de moletom CAFÉ. Nao e produto fisico, nao gera envio e funciona apenas como doacao ao projeto.',
    price: 19.9,
    oldPrice: 39.9,
    stock: 18,
    images: [
      '/images/produtos/moletons/preta/banner.png',
      '/images/produtos/moletons/preta/frente.png',
      '/images/produtos/moletons/preta/tras.png',
      '/images/produtos/moletons/branca/banner.png',
      '/images/produtos/moletons/branca/frente.jpg',
      '/images/produtos/moletons/branca/tras.jpeg',
    ],
    status: ProductStatus.ACTIVE,
    featured: true,
    category: fallbackCategories[2],
    reviewCount: 0,
    averageRating: 0,
  },
  {
    id: 'prod-caneca',
    name: 'Caneca Café Store',
    slug: 'caneca-cafe-store',
    sku: 'CAF-CAN-CER-000004',
    description:
      'Apoio simbolico com imagem ilustrativa de caneca CAFÉ. Nao e produto fisico, nao gera envio e funciona apenas como doacao ao projeto.',
    price: 7.9,
    oldPrice: 14.9,
    stock: 50,
    images: [
      '/images/produtos/caneca/preta/banner.png',
      '/images/produtos/banner.png',
      '/images/produtos/caneca/preta/design.png',
      '/images/produtos/caneca/preta/frente.png',
      '/images/produtos/caneca/preta/tras.png',
      '/images/produtos/caneca/branca/banner.png',
      '/images/produtos/caneca/branca/design.jpeg',
      '/images/produtos/caneca/branca/frente.jpeg',
      '/images/produtos/caneca/branca/tras.jpeg',
    ],
    status: ProductStatus.ACTIVE,
    featured: true,
    category: fallbackCategories[1],
    reviewCount: 0,
    averageRating: 0,
  },
  {
    id: 'prod-chaveiro-mascote',
    name: 'Chaveiro Mascote Café Store',
    slug: 'chaveiro-mascote-cafe-store',
    sku: 'CAF-CHA-MAS-000005',
    description:
      'Apoio simbolico com imagem ilustrativa de chaveiro CAFÉ. Nao e produto fisico, nao gera envio e funciona apenas como doacao ao projeto.',
    price: 4.9,
    oldPrice: 9.9,
    stock: 80,
    images: [
      '/images/produtos/chaveiro/design.png',
      '/images/produtos/chaveiro/frente.png',
      '/images/produtos/chaveiro/verso.png',
    ],
    status: ProductStatus.ACTIVE,
    featured: true,
    category: fallbackCategories[3],
    reviewCount: 0,
    averageRating: 0,
  },
];

const productListSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  description: true,
  price: true,
  oldPrice: true,
  stock: true,
  images: true,
  status: true,
  featured: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  reviews: {
    where: {
      approved: true,
    },
    select: {
      rating: true,
    },
  },
} satisfies Prisma.ProductSelect;

const productReviewSelect = {
  id: true,
  rating: true,
  comment: true,
  videoUrl: true,
  verifiedPurchase: true,
  createdAt: true,
  user: {
    select: {
      name: true,
      image: true,
    },
  },
} satisfies Prisma.ReviewSelect;

const emptyProducts: PaginatedProducts = {
  products: [],
  pagination: {
    page: 1,
    perPage: 12,
    total: 0,
    totalPages: 1,
  },
};

function getFallbackProducts(filters: ProductFilters = {}): PaginatedProducts {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.max(1, Math.min(48, filters.perPage ?? 12));
  const search = filters.search?.toLowerCase().trim();
  let products = fallbackProducts.filter((product) => {
    if (filters.featured !== undefined && product.featured !== filters.featured) return false;
    if (filters.category && product.category.slug !== filters.category) return false;
    if (search && !product.name.toLowerCase().includes(search)) return false;
    return true;
  });

  if (filters.sort === 'price-asc') {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (filters.sort === 'price-desc') {
    products = [...products].sort((a, b) => b.price - a.price);
  } else {
    products = [...products].sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  const total = products.length;
  const start = (page - 1) * perPage;

  return {
    products: products.slice(start, start + perPage),
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    },
  };
}

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function toProductListItem(product: Prisma.ProductGetPayload<{ select: typeof productListSelect }>) {
  const reviewCount = product.reviews.length;
  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.price.toNumber(),
    oldPrice: product.oldPrice?.toNumber() ?? null,
    stock: product.stock,
    images: product.images,
    status: product.status,
    featured: product.featured,
    category: product.category,
    reviewCount,
    averageRating,
  };
}

function getWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  return {
    status: ProductStatus.ACTIVE,
    featured: filters.featured,
    category: filters.category
      ? {
          slug: filters.category,
        }
      : undefined,
    name: filters.search
      ? {
          contains: filters.search,
          mode: 'insensitive',
        }
      : undefined,
  };
}

function getOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
  if (sort === 'price-asc') {
    return { price: 'asc' };
  }

  if (sort === 'price-desc') {
    return { price: 'desc' };
  }

  if (sort === 'newest') {
    return { createdAt: 'desc' };
  }

  return { featured: 'desc' };
}

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
  if (!hasDatabaseUrl()) {
    return getFallbackProducts(filters);
  }

  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.max(1, Math.min(48, filters.perPage ?? 12));
  const where = getWhere(filters);

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: getOrderBy(filters.sort),
        skip: (page - 1) * perPage,
        take: perPage,
        select: productListSelect,
      }),
      prisma.product.count({
        where,
      }),
    ]);

    return {
      products: products.map(toProductListItem),
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
      },
    };
  } catch {
    return getFallbackProducts(filters);
  }
}

export async function getFeaturedProducts(limit = 8) {
  const { products } = await getProducts({
    featured: true,
    perPage: limit,
  });

  return products;
}

const fallbackProductVariants: Record<string, Prisma.JsonValue> = {
  'prod-camiseta-algodao': JSON.parse('[{"name":"Tamanho","values":["P","M","G","GG","XG"]},{"name":"Cor","values":["Preta","Branca"]}]'),
  'prod-tech-tee': JSON.parse('[{"name":"Tamanho","values":["P","M","G","GG","XG"]},{"name":"Cor","values":["Preta","Branca"]}]'),
  'prod-moletom-limited': JSON.parse('[{"name":"Tamanho","values":["P","M","G","GG","XG"]},{"name":"Cor","values":["Preta","Branca"]}]'),
  'prod-caneca': JSON.parse('[{"name":"Capacidade","values":["325ml"]},{"name":"Cor","values":["Preta","Branca"]}]'),
  'prod-chaveiro-mascote': JSON.parse('[{"name":"Modelo","values":["Frente colorida + verso preto"]}]'),
};

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (!hasDatabaseUrl()) {
    const product = fallbackProducts.find((item) => item.slug === slug);
    return product ? { ...product, variants: fallbackProductVariants[product.id] ?? [], reviews: [] } : null;
  }

  const product = await prisma.product
    .findFirst({
      where: {
        slug,
        status: ProductStatus.ACTIVE,
      },
      select: {
        ...productListSelect,
        variants: true,
        reviews: {
          where: {
            approved: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: productReviewSelect,
        },
      },
    })
    .catch(() => {
      const fallback = fallbackProducts.find((item) => item.slug === slug);
      return fallback ? ({ ...fallback, variants: fallbackProductVariants[fallback.id] ?? [], reviews: [] } as ProductDetail) : null;
    });

  if (!product) {
    return null;
  }

  if ('reviewCount' in product) {
    return product as ProductDetail;
  }

  return {
    ...toProductListItem(product),
    variants: product.variants,
    reviews: product.reviews.map((review) => ({
      ...review,
      images: [],
    })),
  };
}

export async function getRelatedProducts(product: ProductDetail, limit = 4) {
  if (!hasDatabaseUrl()) {
    return fallbackProducts
      .filter((item) => item.id !== product.id && item.category.slug === product.category.slug)
      .slice(0, limit);
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        id: {
          not: product.id,
        },
        status: ProductStatus.ACTIVE,
        categoryId: product.category.id,
      },
      take: limit,
      orderBy: {
        featured: 'desc',
      },
      select: productListSelect,
    });

    return products.map(toProductListItem);
  } catch {
    return fallbackProducts
      .filter((item) => item.id !== product.id && item.category.slug === product.category.slug)
      .slice(0, limit);
  }
}

export async function getCategories() {
  if (!hasDatabaseUrl()) {
    return fallbackCategories.map((category) => ({
      ...category,
      _count: {
        products: fallbackProducts.filter((product) => product.category.slug === category.slug).length,
      },
    }));
  }

  return prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      _count: {
        select: {
          products: {
            where: {
              status: ProductStatus.ACTIVE,
            },
          },
        },
      },
    },
  }).catch(() =>
    fallbackCategories.map((category) => ({
      ...category,
      _count: {
        products: fallbackProducts.filter((product) => product.category.slug === category.slug).length,
      },
    })),
  );
}
