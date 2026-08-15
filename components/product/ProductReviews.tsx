import { Star } from "lucide-react";
import { ProductImage } from "@/components/product/ProductImage";
import type { ProductDetailData } from "@/types/product";
import { formatDate } from "@/utils/formatDate";
export function ProductReviews({
  reviews,
  rating,
}: Pick<ProductDetailData, "reviews" | "rating">) {
  return (
    <section className="border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Đánh giá sản phẩm</h2>
          <p className="mt-1 text-xs text-gray-500">
            Đánh giá từ khách đã mua hàng.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 px-3 py-2">
          <Star className="fill-amber-400 text-amber-400" size={18} />
          <strong className="text-lg">{rating || "—"}</strong>
          <span className="text-xs text-gray-500">/ 5</span>
        </div>
      </div>
      {reviews.length ? (
        <div className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <article className="py-4" key={review.id}>
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">{review.userName}</p>
                  <div className="mt-1 flex">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        className={
                          index < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }
                        key={index}
                        size={14}
                      />
                    ))}
                  </div>
                </div>
                <time className="text-xs text-gray-400">
                  {formatDate(review.createdAt)}
                </time>
              </div>
              {review.title ? (
                <h3 className="mt-2 font-bold">{review.title}</h3>
              ) : null}
              {review.comment ? (
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {review.comment}
                </p>
              ) : null}
              {review.images.length ? (
                <div className="mt-3 flex gap-2">
                  {review.images.map((image, index) => (
                    <ProductImage
                      alt={`Ảnh đánh giá ${index + 1}`}
                      className="size-20 border"
                      key={image}
                      src={image}
                    />
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-gray-500">
          Sản phẩm chưa có đánh giá được duyệt.
        </p>
      )}
    </section>
  );
}
