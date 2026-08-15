"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { ApiActionButton } from "@/components/admin/ApiActionButton";
import { DateTimeSelect } from "@/components/admin/DateTimeSelect";
import { formatCurrency } from "@/utils/formatCurrency";
type Coupon = {
  id: string;
  code: string;
  name: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string | null;
  endDate: string | null;
  status: boolean;
};
const empty = {
  code: "",
  name: "",
  discountType: "PERCENT" as const,
  discountValue: 10,
  minOrderValue: 0,
  maxDiscount: null,
  usageLimit: null,
  startDate: null,
  endDate: null,
  status: true,
};
export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [edit, setEdit] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const current = edit ?? empty;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const start = String(form.get("startDate") || "");
    const end = String(form.get("endDate") || "");
    const payload = {
      code: form.get("code"),
      name: form.get("name"),
      discountType: form.get("discountType"),
      discountValue: Number(form.get("discountValue")),
      minOrderValue: Number(form.get("minOrderValue")),
      maxDiscount: form.get("maxDiscount")
        ? Number(form.get("maxDiscount"))
        : null,
      usageLimit: form.get("usageLimit")
        ? Number(form.get("usageLimit"))
        : null,
      startDate: start ? new Date(start).toISOString() : null,
      endDate: end ? new Date(end).toISOString() : null,
      status: form.get("status") === "on",
    };
    try {
      const response = await fetch(
        edit ? `/api/admin/coupons/${edit.id}` : "/api/admin/coupons",
        {
          method: edit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({
        icon: "success",
        title: "Đã lưu mã giảm giá",
        timer: 800,
        showConfirmButton: false,
      });
      setEdit(null);
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể lưu",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[440px_1fr]">
      <form
        className="admin-card h-fit"
        key={edit?.id ?? "new"}
        onSubmit={submit}
      >
        <div className="border-b border-[#e7dfd5] pb-3">
          <h2 className="admin-section-title">
            {edit ? "Sửa mã giảm giá" : "Tạo mã giảm giá"}
          </h2>
          <p className="mt-1 text-xs text-[#7d7068]">
            Thiết lập ưu đãi và thời gian áp dụng.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="form-label">
            Mã
            <input
              className="form-control uppercase"
              defaultValue={current.code}
              name="code"
              required
            />
          </label>
          <label className="form-label">
            Tên chương trình
            <input
              className="form-control"
              defaultValue={current.name}
              name="name"
            />
          </label>
          <label className="form-label">
            Hình thức
            <select
              className="form-control"
              defaultValue={current.discountType}
              name="discountType"
            >
              <option value="PERCENT">Giảm theo phần trăm</option>
              <option value="FIXED">Giảm số tiền cố định</option>
            </select>
          </label>
          <label className="form-label">
            Giá trị
            <input
              className="form-control"
              defaultValue={current.discountValue}
              min="1"
              name="discountValue"
              required
              type="number"
            />
          </label>
          <label className="form-label">
            Đơn tối thiểu
            <input
              className="form-control"
              defaultValue={current.minOrderValue}
              min="0"
              name="minOrderValue"
              type="number"
            />
          </label>
          <label className="form-label">
            Giảm tối đa
            <input
              className="form-control"
              defaultValue={current.maxDiscount ?? ""}
              min="1"
              name="maxDiscount"
              type="number"
            />
          </label>
          <label className="form-label">
            Giới hạn lượt dùng
            <input
              className="form-control"
              defaultValue={current.usageLimit ?? ""}
              min="0"
              name="usageLimit"
              type="number"
            />
          </label>
          <span />
          <DateTimeSelect
            label="Bắt đầu"
            name="startDate"
            value={current.startDate}
          />
          <DateTimeSelect
            label="Kết thúc"
            name="endDate"
            value={current.endDate}
          />
        </div>
        <label className="mt-4 flex gap-2 text-sm font-bold">
          <input
            defaultChecked={current.status}
            name="status"
            type="checkbox"
          />{" "}
          Đang hoạt động
        </label>
        <div className="mt-5 flex gap-2">
          <button className="admin-primary-button flex-1" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu mã giảm giá"}
          </button>
          {edit ? (
            <button
              className="rounded-md border border-[#d9cabc] px-4 font-bold"
              onClick={() => setEdit(null)}
              type="button"
            >
              Hủy
            </button>
          ) : null}
        </div>
      </form>
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Ưu đãi</th>
                <th>Điều kiện</th>
                <th>Đã dùng</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {coupons.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.code}</strong>
                    <small className="block text-slate-400">{item.name}</small>
                  </td>
                  <td>
                    {item.discountType === "PERCENT"
                      ? `${item.discountValue}%`
                      : formatCurrency(item.discountValue)}
                  </td>
                  <td>Từ {formatCurrency(item.minOrderValue)}</td>
                  <td>
                    {item.usedCount}/{item.usageLimit ?? "Không giới hạn"}
                  </td>
                  <td>{item.status ? "Đang hoạt động" : "Ngừng hoạt động"}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="rounded-md bg-[#f5f2eb] px-3 py-2 text-xs font-bold text-[#8c6d53]"
                        onClick={() => setEdit(item)}
                      >
                        Sửa
                      </button>
                      <ApiActionButton
                        className="bg-rose-50 text-rose-700"
                        confirmText="Xóa hoặc vô hiệu mã giảm giá này?"
                        label="Xóa"
                        method="DELETE"
                        url={`/api/admin/coupons/${item.id}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
