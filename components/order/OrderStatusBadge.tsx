"use client";

import { Ban } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { OrderStatus } from "@/types/order";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const pathname = usePathname();
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const colors: Record<OrderStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    SHIPPING: "bg-violet-50 text-violet-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    CANCELLED: "bg-rose-50 text-rose-700",
  };
  const match = pathname.match(/^\/orders\/(\d+)$/);

  async function cancelOrder() {
    if (!match) return;
    const choice = await Swal.fire({
      icon: "warning",
      title: "Hủy đơn hàng này?",
      text: "Sản phẩm sẽ được hoàn lại kho sau khi đơn được hủy.",
      input: "textarea",
      inputLabel: "Lý do hủy (không bắt buộc)",
      inputPlaceholder: "Nhập lý do bạn muốn hủy đơn...",
      showCancelButton: true,
      confirmButtonText: "Xác nhận hủy",
      cancelButtonText: "Quay lại",
      confirmButtonColor: "#be123c",
    });
    if (!choice.isConfirmed) return;
    setCancelling(true);
    try {
      const response = await fetch(`/api/orders/${match[1]}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel", reason: choice.value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({
        icon: "success",
        title: "Đã hủy đơn hàng",
        timer: 900,
        showConfirmButton: false,
      });
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể hủy đơn",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <span
        className={`inline-flex rounded-sm px-2 py-1 text-xs font-bold ${colors[status]}`}
      >
        {ORDER_STATUS_LABELS[status]}
      </span>
      {status === "PENDING" && match ? (
        <button
          className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-rose-200 bg-white px-3 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60"
          disabled={cancelling}
          onClick={() => void cancelOrder()}
          type="button"
        >
          <Ban size={14} />
          {cancelling ? "Đang hủy..." : "Hủy đơn"}
        </button>
      ) : null}
    </div>
  );
}
