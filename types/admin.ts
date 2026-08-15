export type AdminProductInput = {
  name: string;
  slug: string;
  categoryId: string;
  brandId?: string | null;
  shortDescription?: string;
  description?: string;
  thumbnail?: string;
  featured: boolean;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  images: string[];
  specifications: Array<{
    id?: string;
    name: string;
    value: string;
    sortOrder: number;
  }>;
  variants: Array<{
    id?: string;
    sku: string;
    price: number;
    salePrice?: number | null;
    stock: number;
    image?: string;
    status: boolean;
    attributeValueIds: string[];
  }>;
};
