"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { allowedOrderTransitions } from "@/lib/order-status";
import type { OrderStatus } from "@/types/order";
export function OrderStatusForm({
  id,
  current,
}: {
  id: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const options = allowedOrderTransitions[current];
  const [saving, setSaving] = useState(false);
  if (!options.length)
    return (
      <p className="rounded-lg bg-[#f5f2eb] p-4 text-sm font-bold text-[#7d7068]">
        Đơn hàng đã ở trạng thái cuối.
      </p>
    );
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const status = String(form.get("status")) as OrderStatus;
    const payload = {
      status,
      note: String(form.get("note") || ""),
      cancelledReason: String(form.get("cancelledReason") || ""),
    };
    const choice = await Swal.fire({
      icon: "warning",
      title: `Chuyển đơn sang “${ORDER_STATUS_LABELS[status]}”?`,
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    });
    if (!choice.isConfirmed) {
      setSaving(false);
      return;
    }
    try {
      const response = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({
        icon: "success",
        title: "Đã cập nhật trạng thái",
        timer: 900,
        showConfirmButton: false,
      });
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể cập nhật",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="form-label">
        Trạng thái tiếp theo
        <select className="form-control" name="status">
          {options.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="form-label">
        Ghi chú
        <textarea className="form-control min-h-20 py-3" name="note" />
      </label>
      {options.includes("CANCELLED") ? (
        <label className="form-label">
          Lý do hủy (bắt buộc khi chọn “Đã hủy”)
          <textarea
            className="form-control min-h-20 py-3"
            name="cancelledReason"
          />
        </label>
      ) : null}
      <button className="admin-primary-button w-full" disabled={saving}>
        {saving ? "Đang cập nhật..." : "Cập nhật trạng thái"}
      </button>
    </form>
  );
}
