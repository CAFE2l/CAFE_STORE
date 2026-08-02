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
    name: 'Camiseta Algodao Cafe Store',
    slug: 'camiseta-algodao-cafe-store',
    description:
      'Apoio simbolico com imagem ilustrativa de camiseta CAFÉ. Nao e produto fisico, nao gera envio e funciona apenas como doacao ao projeto.',
    price: 9.9,
    oldPrice: 19.9,
    stock: 74,
    categorySlug: 'camisetas',
    featured: true,
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
    variants: [
      { name: 'Tamanho', values: ['P', 'M', 'G', 'GG', 'XG'] },
      { name: 'Cor', values: ['Preta', 'Branca'] },
    ],
  },
  {
    name: 'Tech Tee Dry Pro Cafe Store',
    slug: 'tech-tee-dry-pro-cafe-store',
    description:
      'Apoio simbolico com imagem ilustrativa de tech tee CAFÉ. Nao e produto fisico, nao gera envio e funciona apenas como doacao ao projeto.',
    price: 12.9,
    oldPrice: 24.9,
    stock: 54,
    categorySlug: 'camisetas',
    featured: true,
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
    variants: [
      { name: 'Tamanho', values: ['P', 'M', 'G', 'GG', 'XG'] },
      { name: 'Cor', values: ['Preta', 'Branca'] },
    ],
  },
  {
    name: 'Moletom Limited Edition Cafe Store',
    slug: 'moletom-limited-edition-cafe-store',
    description:
      'Apoio simbolico com imagem ilustrativa de moletom CAFÉ. Nao e produto fisico, nao gera envio e funciona apenas como doacao ao projeto.',
    price: 19.9,
    oldPrice: 39.9,
    stock: 18,
    categorySlug: 'moletons',
    featured: true,
    images: [
      '/images/produtos/moletons/preta/banner.png',
      '/images/produtos/moletons/preta/frente.png',
      '/images/produtos/moletons/preta/tras.png',
      '/images/produtos/moletons/branca/banner.png',
      '/images/produtos/moletons/branca/frente.jpg',
      '/images/produtos/moletons/branca/tras.jpeg',
    ],
    variants: [
      { name: 'Tamanho', values: ['P', 'M', 'G', 'GG', 'XG'] },
      { name: 'Cor', values: ['Preta', 'Branca'] },
    ],
  },
  {
    name: 'Caneca Cafe Store',
    slug: 'caneca-cafe-store',
    description:
      'Apoio simbolico com imagem ilustrativa de caneca CAFÉ. Nao e produto fisico, nao gera envio e funciona apenas como doacao ao projeto.',
    price: 7.9,
    oldPrice: 14.9,
    stock: 95,
    categorySlug: 'canecas',
    featured: true,
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
    variants: [
      { name: 'Capacidade', values: ['325ml'] },
      { name: 'Cor', values: ['Preta', 'Branca'] },
    ],
  },
  {
    name: 'Chaveiro Mascote Cafe Store',
    slug: 'chaveiro-mascote-cafe-store',
    description:
      'Apoio simbolico com imagem ilustrativa de chaveiro CAFÉ. Nao e produto fisico, nao gera envio e funciona apenas como doacao ao projeto.',
    price: 4.9,
    oldPrice: 9.9,
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

const deprecatedSlugs = [
  'cafe-bourbon-amarelo',
  'cafe-catucai-vermelho',
  'kit-ritual-v60',
  'camiseta-algodao-preta-cafe-store',
  'camiseta-algodao-branca-cafe-store',
  'tech-tee-dry-pro-preta-cafe-store',
  'tech-tee-dry-pro-branca-cafe-store',
  'caneca-preta-cafe-store',
  'caneca-branca-cafe-store',
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
    where: { slug: { in: deprecatedSlugs } },
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
