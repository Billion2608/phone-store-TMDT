"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export function ApiActionButton({
  url,
  method = "PATCH",
  body,
  label,
  confirmText,
  className = "",
}: {
  url: string;
  method?: "PATCH" | "DELETE" | "POST";
  body?: unknown;
  label: string;
  confirmText?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function act() {
    if (confirmText) {
      const choice = await Swal.fire({
        icon: "warning",
        title: confirmText,
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
      });
      if (!choice.isConfirmed) return;
    }
    setLoading(true);
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({
        icon: "success",
        title: "Cập nhật thành công",
        timer: 900,
        showConfirmButton: false,
      });
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể thực hiện",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      className={`rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50 ${className}`}
      disabled={loading}
      onClick={act}
    >
      {loading ? "Đang xử lý..." : label}
    </button>
  );
}
