export type CartItemData = {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string | null;
  sku: string;
  attributes: Array<{ name: string; value: string }>;
  price: number;
  originalPrice: number;
  quantity: number;
  stock: number;
  subtotal: number;
};

export type CartData = {
  id: string | null;
  items: CartItemData[];
  itemCount: number;
  subtotal: number;
};
