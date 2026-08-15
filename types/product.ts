export type ProductSort =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";

export type ProductQuery = {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  limit?: number;
};

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  brand: string | null;
  category: string;
  price: number;
  salePrice: number | null;
  rating: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
};

export type ProductVariantData = {
  id: string;
  sku: string;
  price: number;
  salePrice: number | null;
  stock: number;
  image: string | null;
  attributes: Array<{ name: string; value: string }>;
};

export type ProductDetailData = ProductCardData & {
  shortDescription: string | null;
  description: string | null;
  images: string[];
  variants: ProductVariantData[];
  specifications: Array<{ name: string; value: string }>;
  reviews: Array<{
    id: string;
    userName: string;
    rating: number;
    title: string | null;
    comment: string | null;
    createdAt: string;
    images: string[];
  }>;
};
