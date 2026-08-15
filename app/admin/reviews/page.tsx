import { Star } from "lucide-react";
import Link from "next/link";
import { ApiActionButton } from "@/components/admin/ApiActionButton";
import { getAdminReviews } from "@/services/admin.service";
import { formatDate } from "@/utils/formatDate";
export default async function AdminReviewsPage() {
  const reviews = await getAdminReviews();
  return (
    <div>
      <h1 className="admin-page-title">Đánh giá</h1>
      <p className="admin-page-subtitle">
        Duyệt nội dung đánh giá từ khách hàng đã mua.
      </p>
      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <article className="admin-card" key={review.id}>
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <strong>{review.user}</strong>
                <small className="ml-2 text-slate-400">{review.email}</small>
                <p className="mt-1 text-sm">
                  Sản phẩm:{" "}
                  <Link
                    className="font-bold text-sky-700"
                    href={`/products/${review.productSlug}`}
                  >
                    {review.product}
                  </Link>
                </p>
              </div>
              <span className="admin-badge">{review.status}</span>
            </div>
            <div className="mt-3 flex">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  className={
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }
                  key={i}
                  size={17}
                />
              ))}
            </div>
            {review.title ? (
              <h3 className="mt-3 font-bold">{review.title}</h3>
            ) : null}
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {review.comment}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <time className="text-xs text-slate-400">
                {formatDate(review.createdAt)}
              </time>
              <div className="flex gap-2">
                <ApiActionButton
                  body={{ status: "APPROVED" }}
                  className="bg-emerald-50 text-emerald-700"
                  label="Duyệt"
                  url={`/api/admin/reviews/${review.id}`}
                />
                <ApiActionButton
                  body={{ status: "REJECTED" }}
                  className="bg-rose-50 text-rose-700"
                  label="Từ chối"
                  url={`/api/admin/reviews/${review.id}`}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
