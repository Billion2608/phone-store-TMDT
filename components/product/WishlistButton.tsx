"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export function WishlistButton({
  productId,
  initialActive = false,
  onRemoved,
}: {
  productId: string;
  initialActive?: boolean;
  onRemoved?: () => void;
}) {
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/wishlist", {
        method: active ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const result = await response.json();
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error(result.message);
      const next = !active;
      setActive(next);
      if (!next) onRemoved?.();
      await Swal.fire({
        icon: "success",
        title: next ? "Đã thêm vào yêu thích" : "Đã xóa khỏi yêu thích",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể cập nhật",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      aria-label={active ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
      className={`rounded-full bg-white/90 p-2 shadow-sm transition ${active ? "text-rose-500" : "text-slate-500 hover:text-rose-500"}`}
      disabled={loading}
      onClick={toggle}
    >
      <Heart className={active ? "fill-current" : ""} size={18} />
    </button>
  );
}
