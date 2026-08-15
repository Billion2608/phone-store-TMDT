"use client";
import { Star, X } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
export function ReviewForm({
  orderItemId,
  productName,
}: {
  orderItemId: string;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItemId,
          rating,
          title: form.get("title"),
          comment: form.get("comment"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({
        icon: "success",
        title: "Đã gửi đánh giá",
        text: "Đánh giá đang chờ quản trị viên duyệt.",
      });
      window.location.reload();
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể gửi đánh giá",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
      setSubmitting(false);
    }
  }
  return (
    <>
      <button
        className="rounded-sm border border-blue-300 px-3 py-1.5 text-xs font-bold text-blue-700"
        onClick={() => setOpen(true)}
      >
        Viết đánh giá
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <form
            className="w-full max-w-lg rounded-md border border-gray-200 bg-white p-5 shadow-xl"
            onSubmit={submit}
          >
            <div className="flex justify-between border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-lg font-bold">Đánh giá sản phẩm</h2>
                <p className="mt-1 text-sm text-gray-500">{productName}</p>
              </div>
              <button
                aria-label="Đóng"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  aria-label={`${value} sao`}
                  key={value}
                  onClick={() => setRating(value)}
                  type="button"
                >
                  <Star
                    className={
                      value <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }
                    size={26}
                  />
                </button>
              ))}
            </div>
            <label className="form-label mt-4">
              Tiêu đề
              <input className="form-control" name="title" />
            </label>
            <label className="form-label mt-3">
              Nhận xét
              <textarea
                className="form-control min-h-24 py-2"
                minLength={3}
                name="comment"
                required
              />
            </label>
            <button
              className="mt-4 h-10 w-full rounded-sm bg-blue-600 font-bold text-white disabled:bg-gray-300"
              disabled={submitting}
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
