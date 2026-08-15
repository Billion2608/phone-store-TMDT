import { prisma } from "@/lib/prisma";
import { BusinessError } from "@/lib/route-error";
import type { CartData } from "@/types/cart";

const cartInclude = {
  cart_items: {
    orderBy: { created_at: "asc" as const },
    include: {
      product_variants: {
        include: {
          products: {
            select: {
              id: true,
              name: true,
              slug: true,
              thumbnail: true,
              status: true,
            },
          },
          variant_attribute_values: {
            include: { attribute_values: { include: { attributes: true } } },
          },
        },
      },
    },
  },
} as const;

export async function getCart(userId: string): Promise<CartData> {
  const cart = await prisma.carts.findUnique({
    where: { user_id: BigInt(userId) },
    include: cartInclude,
  });
  if (!cart) return { id: null, items: [], itemCount: 0, subtotal: 0 };

  const items = cart.cart_items.map((item) => {
    const variant = item.product_variants;
    const price = Number(variant.sale_price ?? variant.price);
    return {
      id: item.id.toString(),
      variantId: variant.id.toString(),
      productId: variant.products.id.toString(),
      productName: variant.products.name,
      productSlug: variant.products.slug,
      image: variant.image ?? variant.products.thumbnail,
      sku: variant.sku,
      attributes: variant.variant_attribute_values.map((entry) => ({
        name: entry.attribute_values.attributes.name,
        value: entry.attribute_values.value,
      })),
      price,
      originalPrice: Number(variant.price),
      quantity: item.quantity,
      stock: variant.stock_quantity,
      subtotal: price * item.quantity,
    };
  });

  return {
    id: cart.id.toString(),
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
  };
}

export async function addCartItem(
  userId: string,
  variantId: string,
  quantity: number,
) {
  const variant = await prisma.product_variants.findFirst({
    where: {
      id: BigInt(variantId),
      status: true,
      products: { is: { status: "ACTIVE" } },
    },
    select: { stock_quantity: true },
  });
  if (!variant)
    throw new BusinessError("Phiên bản sản phẩm không tồn tại.", 404);
  if (quantity > variant.stock_quantity)
    throw new BusinessError("Số lượng vượt quá tồn kho.", 409);

  const cart = await prisma.carts.upsert({
    where: { user_id: BigInt(userId) },
    update: {},
    create: { user_id: BigInt(userId) },
    select: { id: true },
  });
  const existing = await prisma.cart_items.findUnique({
    where: {
      cart_id_variant_id: { cart_id: cart.id, variant_id: BigInt(variantId) },
    },
    select: { id: true, quantity: true },
  });
  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (nextQuantity > variant.stock_quantity)
    throw new BusinessError("Tổng số lượng trong giỏ vượt quá tồn kho.", 409);

  await prisma.cart_items.upsert({
    where: {
      cart_id_variant_id: { cart_id: cart.id, variant_id: BigInt(variantId) },
    },
    update: { quantity: nextQuantity },
    create: { cart_id: cart.id, variant_id: BigInt(variantId), quantity },
  });
  return getCart(userId);
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number,
) {
  const item = await prisma.cart_items.findFirst({
    where: { id: BigInt(itemId), carts: { is: { user_id: BigInt(userId) } } },
    include: {
      product_variants: { select: { stock_quantity: true, status: true } },
    },
  });
  if (!item) throw new BusinessError("Sản phẩm không có trong giỏ hàng.", 404);
  if (
    !item.product_variants.status ||
    quantity > item.product_variants.stock_quantity
  )
    throw new BusinessError("Số lượng không còn đáp ứng tồn kho.", 409);
  await prisma.cart_items.update({
    where: { id: item.id },
    data: { quantity },
  });
  return getCart(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const result = await prisma.cart_items.deleteMany({
    where: { id: BigInt(itemId), carts: { is: { user_id: BigInt(userId) } } },
  });
  if (!result.count)
    throw new BusinessError("Sản phẩm không có trong giỏ hàng.", 404);
  return getCart(userId);
}
