export type Variant = {
  sku: string;
  color: string; // 'preta' | 'branca' | other
  size: string; // 'P'|'M'|'G'...
  price: number;
  compareAtPrice?: number;
  images: string[]; // urls
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  variants: Variant[];
};

export const mockProduct: Product = {
  id: 'caf-001',
  slug: 'camiseta-cafe',
  title: 'Camiseta CAFÉ STORE',
  description: 'Camiseta oficial CAFÉ STORE — tecido premium, serigrafia durável.',
  variants: [
    // Preta
    { sku: 'CAF-001-BLK-P', color: 'preta', size: 'P', price: 9.9, images: ['/images/black-1.jpg','/images/black-2.jpg','/images/black-3.jpg','/images/black-4.jpg'], stock: 5 },
    { sku: 'CAF-001-BLK-M', color: 'preta', size: 'M', price: 9.9, images: ['/images/black-1.jpg','/images/black-2.jpg','/images/black-3.jpg','/images/black-4.jpg'], stock: 3 },
    { sku: 'CAF-001-BLK-G', color: 'preta', size: 'G', price: 9.9, images: ['/images/black-1.jpg','/images/black-2.jpg','/images/black-3.jpg','/images/black-4.jpg'], stock: 0 },

    // Branca
    { sku: 'CAF-001-WHT-P', color: 'branca', size: 'P', price: 9.9, images: ['/images/white-1.jpg','/images/white-2.jpg','/images/white-3.jpg','/images/white-4.jpg'], stock: 2 },
    { sku: 'CAF-001-WHT-M', color: 'branca', size: 'M', price: 9.9, images: ['/images/white-1.jpg','/images/white-2.jpg','/images/white-3.jpg','/images/white-4.jpg'], stock: 1 },
  ]
};
