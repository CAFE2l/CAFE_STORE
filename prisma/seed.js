const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const categories = [
  { name: 'Camisetas', slug: 'camisetas' },
  { name: 'Canecas', slug: 'canecas' },
  { name: 'Moletons', slug: 'moletons' },
  { name: 'Acessorios', slug: 'acessorios' },
];

const products = [
  {
    name: 'Camiseta Algodao Preta Cafe Store',
    slug: 'camiseta-algodao-preta-cafe-store',
    description:
      'Camiseta preta 100% algodao com mascote CAFÉ em destaque, estampa traseira Create Build Inspire e acabamento premium.',
    price: 89.9,
    oldPrice: 109.9,
    stock: 40,
    categorySlug: 'camisetas',
    featured: true,
    images: [
      '/images/produtos/camisa_normal/preta/banner.png',
      '/images/produtos/camisa_normal/preta/design.jpeg',
      '/images/produtos/camisa_normal/preta/camisaVtirine.png',
      '/images/produtos/camisa_normal/preta/camisa_tras.png',
    ],
    variants: [
      { name: 'Tamanho', values: ['P', 'M', 'G', 'GG', 'XG'] },
      { name: 'Cor', values: ['Preta'] },
    ],
  },
  {
    name: 'Camiseta Algodao Branca Cafe Store',
    slug: 'camiseta-algodao-branca-cafe-store',
    description:
      'Camiseta branca 100% algodao com identidade CAFÉ, mascote em alta definicao e detalhes laranja.',
    price: 89.9,
    oldPrice: 109.9,
    stock: 34,
    categorySlug: 'camisetas',
    featured: true,
    images: [
      '/images/produtos/camisa_normal/branca/banner.png',
      '/images/produtos/camisa_normal/branca/design.jpeg',
      '/images/produtos/camisa_normal/branca/frente.jpeg',
      '/images/produtos/camisa_normal/branca/tras.jpeg',
    ],
    variants: [
      { name: 'Tamanho', values: ['P', 'M', 'G', 'GG', 'XG'] },
      { name: 'Cor', values: ['Branca'] },
    ],
  },
  {
    name: 'Tech Tee Dry Pro Preta Cafe Store',
    slug: 'tech-tee-dry-pro-preta-cafe-store',
    description:
      'Camiseta performance preta com tecnologia Dry Pro, tecido leve, respiravel e visual tech para quem vive o digital.',
    price: 119.9,
    oldPrice: 139.9,
    stock: 28,
    categorySlug: 'camisetas',
    featured: true,
    images: [
      '/images/produtos/poliester/preta/camisa_poliester.png',
      '/images/produtos/poliester/preta/design.png',
      '/images/produtos/poliester/preta/frente.jpeg',
      '/images/produtos/poliester/preta/tras.png',
    ],
    variants: [
      { name: 'Tamanho', values: ['P', 'M', 'G', 'GG', 'XG'] },
      { name: 'Cor', values: ['Preta'] },
    ],
  },
  {
    name: 'Tech Tee Dry Pro Branca Cafe Store',
    slug: 'tech-tee-dry-pro-branca-cafe-store',
    description:
      'Camiseta performance branca com protecao UV, secagem rapida e grafismos CAFÉ em laranja.',
    price: 119.9,
    stock: 26,
    categorySlug: 'camisetas',
    featured: true,
    images: [
      '/images/produtos/poliester/branca/banner.jpeg',
      '/images/produtos/poliester/branca/design.jpeg',
      '/images/produtos/poliester/branca/frente.jpeg',
      '/images/produtos/poliester/branca/tras.jpeg',
    ],
    variants: [
      { name: 'Tamanho', values: ['P', 'M', 'G', 'GG', 'XG'] },
      { name: 'Cor', values: ['Branca'] },
    ],
  },
  {
    name: 'Moletom Limited Edition Cafe Store',
    slug: 'moletom-limited-edition-cafe-store',
    description:
      'Moletom preto limited edition com arte flame, mascote oficial e estampa traseira Create Build Inspire.',
    price: 199.9,
    oldPrice: 239.9,
    stock: 18,
    categorySlug: 'moletons',
    featured: true,
    images: ['/images/produtos/moletons/banner.png', '/images/produtos/moletons/design.png'],
    variants: [
      { name: 'Tamanho', values: ['P', 'M', 'G', 'GG', 'XG'] },
      { name: 'Cor', values: ['Preta'] },
    ],
  },
  {
    name: 'Caneca Preta Cafe Store',
    slug: 'caneca-preta-cafe-store',
    description:
      'Caneca preta com interior laranja, ceramica resistente, acabamento brilhante e arte exclusiva CAFÉ Store.',
    price: 49.9,
    oldPrice: 59.9,
    stock: 50,
    categorySlug: 'canecas',
    featured: true,
    images: [
      '/images/produtos/caneca/preta/banner.png',
      '/images/produtos/banner.png',
      '/images/produtos/caneca/preta/design.png',
      '/images/produtos/caneca/preta/frente.png',
      '/images/produtos/caneca/preta/tras.png',
    ],
    variants: [{ name: 'Capacidade', values: ['325ml'] }],
  },
  {
    name: 'Caneca Branca Cafe Store',
    slug: 'caneca-branca-cafe-store',
    description:
      'Caneca branca com interior laranja, estampa do mascote oficial e verso Create Build Inspire.',
    price: 49.9,
    stock: 45,
    categorySlug: 'canecas',
    featured: false,
    images: [
      '/images/produtos/caneca/branca/banner.png',
      '/images/produtos/caneca/branca/design.jpeg',
      '/images/produtos/caneca/branca/frente.jpeg',
      '/images/produtos/caneca/branca/tras.jpeg',
    ],
    variants: [{ name: 'Capacidade', values: ['325ml'] }],
  },
  {
    name: 'Chaveiro Mascote Cafe Store',
    slug: 'chaveiro-mascote-cafe-store',
    description:
      'Chaveiro do mascote oficial em formato de fogo estilizado, com frente colorida e verso preto texturizado.',
    price: 24.9,
    oldPrice: 29.9,
    stock: 80,
    categorySlug: 'acessorios',
    featured: true,
    images: [
      '/images/produtos/chaveiro/design.png',
      '/images/produtos/chaveiro/frente.png',
      '/images/produtos/chaveiro/verso.png',
    ],
    variants: [{ name: 'Modelo', values: ['Frente colorida + verso preto'] }],
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  await prisma.product.updateMany({
    where: {
      slug: {
        in: ['cafe-bourbon-amarelo', 'cafe-catucai-vermelho', 'kit-ritual-v60'],
      },
    },
    data: {
      status: 'INACTIVE',
      featured: false,
    },
  });

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: product.categorySlug },
    });
    const { categorySlug, ...data } = product;

    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {
        ...data,
        categoryId: category.id,
        status: 'ACTIVE',
      },
      create: {
        ...data,
        categoryId: category.id,
        status: 'ACTIVE',
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
