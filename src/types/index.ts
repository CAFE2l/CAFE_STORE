export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type CartVariant = {
  name: string;
  value: string;
};

export type CartItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock?: number;
  variants?: CartVariant[];
};
