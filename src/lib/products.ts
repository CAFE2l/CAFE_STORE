import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
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

const productListSelect = {
  id: true,
  name: true,
  slug: true,
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

const emptyProducts: PaginatedProducts = {
  products: [],
  pagination: {
    page: 1,
    perPage: 12,
    total: 0,
    totalPages: 1,
  },
};

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
    return {
      ...emptyProducts,
      pagination: {
        ...emptyProducts.pagination,
        page: Math.max(1, filters.page ?? 1),
        perPage: Math.max(1, Math.min(48, filters.perPage ?? 12)),
      },
    };
  }

  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.max(1, Math.min(48, filters.perPage ?? 12));
  const where = getWhere(filters);
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
}

export async function getFeaturedProducts(limit = 8) {
  const { products } = await getProducts({
    featured: true,
    perPage: limit,
  });

  return products;
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const product = await prisma.product.findFirst({
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
        select: {
          id: true,
          rating: true,
          comment: true,
          verifiedPurchase: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  return {
    ...toProductListItem(product),
    variants: product.variants,
    reviews: product.reviews,
  };
}

export async function getRelatedProducts(product: ProductDetail, limit = 4) {
  if (!hasDatabaseUrl()) {
    return [];
  }

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
}

export async function getCategories() {
  if (!hasDatabaseUrl()) {
    return [];
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
          products: true,
        },
      },
    },
  });
}
