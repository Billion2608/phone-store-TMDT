import { prisma } from "@/lib/prisma";
import { BusinessError } from "@/lib/route-error";

export async function createReview(
  userId: string,
  input: {
    orderItemId: string;
    rating: number;
    title?: string;
    comment?: string;
  },
) {
  const orderItem = await prisma.order_items.findFirst({
    where: {
      id: BigInt(input.orderItemId),
      orders: { is: { user_id: BigInt(userId), status: "COMPLETED" } },
    },
    include: {
      product_variants: { select: { product_id: true } },
      reviews: { where: { user_id: BigInt(userId) }, select: { id: true } },
    },
  });
  if (!orderItem)
    throw new BusinessError(
      "Bạn chỉ có thể đánh giá sản phẩm trong đơn hàng đã hoàn thành.",
      403,
    );
  if (orderItem.reviews.length)
    throw new BusinessError("Sản phẩm này đã được đánh giá.", 409);

  const review = await prisma.reviews.create({
    data: {
      user_id: BigInt(userId),
      product_id: orderItem.product_variants.product_id,
      order_item_id: orderItem.id,
      rating: input.rating,
      title: input.title || null,
      comment: input.comment || null,
      status: "PENDING",
    },
    select: { id: true, status: true },
  });
  return { id: review.id.toString(), status: review.status };
}
