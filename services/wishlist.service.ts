import { prisma } from "@/lib/prisma";
import { BusinessError } from "@/lib/route-error";
import type { ProductCardData } from "@/types/product";

export async function getWishlist(userId: string): Promise<ProductCardData[]> {
  const rows = await prisma.wishlists.findMany({
    where: { user_id: BigInt(userId), products: { is: { status: "ACTIVE" } } },
    orderBy: { created_at: "desc" },
    include: {
      products: {
        include: {
          brands: { select: { name: true } },
          categories: { select: { name: true } },
          product_variants: {
            where: { status: true },
            select: { price: true, sale_price: true, stock_quantity: true },
          },
          reviews: { where: { status: "APPROVED" }, select: { rating: true } },
        },
      },
    },
  });
  return rows.map(({ products: product }) => {
    const variants = [...product.product_variants].sort(
      (a, b) =>
        Number(a.sale_price ?? a.price) - Number(b.sale_price ?? b.price),
    );
    const cheapest = variants[0];
    return {
      id: product.id.toString(),
      name: product.name,
      slug: product.slug,
      thumbnail: product.thumbnail,
      brand: product.brands?.name ?? null,
      category: product.categories.name,
      price: cheapest ? Number(cheapest.price) : 0,
      salePrice: cheapest?.sale_price ? Number(cheapest.sale_price) : null,
      rating: product.reviews.length
        ? Math.round(
            (product.reviews.reduce((sum, review) => sum + review.rating, 0) /
              product.reviews.length) *
              10,
          ) / 10
        : 0,
      reviewCount: product.reviews.length,
      soldCount: Number(product.sold_count),
      stock: variants.reduce((sum, variant) => sum + variant.stock_quantity, 0),
    };
  });
}

export async function addWishlist(userId: string, productId: string) {
  const product = await prisma.products.findFirst({
    where: { id: BigInt(productId), status: "ACTIVE" },
    select: { id: true },
  });
  if (!product) throw new BusinessError("Sản phẩm không tồn tại.", 404);
  await prisma.wishlists.upsert({
    where: {
      user_id_product_id: { user_id: BigInt(userId), product_id: product.id },
    },
    update: {},
    create: { user_id: BigInt(userId), product_id: product.id },
  });
  return { productId };
}

export async function removeWishlist(userId: string, productId: string) {
  await prisma.wishlists.deleteMany({
    where: { user_id: BigInt(userId), product_id: BigInt(productId) },
  });
  return { productId };
}
