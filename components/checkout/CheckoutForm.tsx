"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import type { CartData } from "@/types/cart";
import { formatCurrency } from "@/utils/formatCurrency";
import { AddressFields } from "@/components/address/AddressFields";
type Address = {
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
} | null;
type Method = "COD" | "VNPAY" | "MOMO";

export function CheckoutForm({
  cart,
  user,
  savedAddress,
}: {
  cart: CartData;
  user: { fullName: string; phone: string | null };
  savedAddress: Address;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<Method>("COD");
  const initial = savedAddress ?? {
    receiverName: user.fullName,
    phone: user.phone ?? "",
    province: "",
    district: "",
    ward: "",
    address: "",
  };
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      receiverName: form.get("receiverName"),
      phone: form.get("phone"),
      province: form.get("province"),
      district: form.get("district"),
      ward: form.get("ward"),
      address: form.get("address"),
      note: form.get("note"),
      couponCode: form.get("couponCode"),
      paymentMethod: method,
      saveAddress: form.has("saveAddress"),
    };
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      if (result.data.paymentUrl) {
        window.location.assign(result.data.paymentUrl);
        return;
      }
      await Swal.fire({
        icon: "success",
        title: "Đặt hàng thành công",
        text: `Mã đơn: ${result.data.orderCode}`,
        confirmButtonText: "Xem đơn hàng",
      });
      router.push(`/orders/${result.data.id}`);
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Chưa thể đặt hàng",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
      setSubmitting(false);
    }
  }
  const methods: Array<{ value: Method; title: string; text: string }> = [
    { value: "COD", title: "Thanh toán COD", text: "Trả tiền khi nhận hàng" },
    {
      value: "VNPAY",
      title: "Thanh toán VNPay",
      text: "ATM, QR và thẻ ngân hàng",
    },
    { value: "MOMO", title: "Ví MoMo", text: "Thanh toán qua ứng dụng MoMo" },
  ];
  return (
    <form
      autoComplete="off"
      className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]"
      onSubmit={submit}
    >
      <div className="space-y-5">
        <section className="checkout-section">
          <div className="border-b border-[#e7dfd5] pb-3">
            <h2 className="font-bold">Thông tin nhận hàng</h2>
            <p className="text-xs text-[#7d7068]">
              Nhập chính xác để đơn hàng được giao thuận lợi.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="form-label">
              Người nhận
              <input
                autoComplete="off"
                className="form-control"
                defaultValue={initial.receiverName}
                name="receiverName"
                required
              />
            </label>
            <label className="form-label">
              Số điện thoại
              <input
                autoComplete="off"
                className="form-control"
                defaultValue={initial.phone}
                name="phone"
                required
              />
            </label>
            <AddressFields initial={initial} />
            <label className="form-label sm:col-span-2">
              Ghi chú
              <textarea
                autoComplete="off"
                className="form-control min-h-20 py-2"
                name="note"
              />
            </label>
          </div>
          <label className="mt-4 flex items-center gap-2 rounded-md bg-[#fdfbf7] p-3 text-sm font-semibold">
            <input defaultChecked name="saveAddress" type="checkbox" /> Lưu địa
            chỉ cho lần mua tiếp theo
          </label>
        </section>
        <section className="checkout-section">
          <h2 className="checkout-title">Phương thức thanh toán</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {methods.map((item) => (
              <button
                className={`min-h-20 rounded-lg border p-3 text-left transition-colors ${method === item.value ? "border-[#8c6d53] bg-[#f5f2eb]" : "border-[#e7dfd5] bg-white hover:border-[#cdb9a7]"}`}
                key={item.value}
                onClick={() => setMethod(item.value)}
                type="button"
              >
                <strong className="block text-sm">{item.title}</strong>
                <small className="mt-1 block text-[#7d7068]">{item.text}</small>
              </button>
            ))}
          </div>
        </section>
      </div>
      <aside className="h-fit rounded-lg border border-[#e7dfd5] bg-white p-5 shadow-sm lg:sticky lg:top-32">
        <h2 className="border-b border-[#e7dfd5] pb-3 text-lg font-bold">
          Đơn hàng ({cart.itemCount})
        </h2>
        <div className="mt-3 max-h-64 divide-y divide-[#eee8e1] overflow-auto">
          {cart.items.map((item) => (
            <div
              className="flex justify-between gap-3 py-3 text-sm"
              key={item.id}
            >
              <span className="line-clamp-2 text-[#61554e]">
                {item.productName} × {item.quantity}
              </span>
              <strong className="shrink-0">
                {formatCurrency(item.subtotal)}
              </strong>
            </div>
          ))}
        </div>
        <label className="form-label mt-4 border-t border-[#e7dfd5] pt-4">
          Mã giảm giá
          <input
            autoComplete="off"
            className="form-control uppercase"
            name="couponCode"
            placeholder="Nhập mã nếu có"
          />
        </label>
        <div className="mt-4 flex justify-between text-sm">
          <span>Tạm tính</span>
          <strong>{formatCurrency(cart.subtotal)}</strong>
        </div>
        <p className="mt-3 rounded-md bg-[#f5f2eb] p-3 text-xs leading-5 text-[#6f523e]">
          Giá và tồn kho được máy chủ xác minh lại trước khi tạo đơn.
        </p>
        <button
          className="mt-4 h-12 w-full rounded-md bg-[#8c6d53] font-bold text-white hover:bg-[#6f523e] disabled:bg-gray-300"
          disabled={submitting}
        >
          {submitting
            ? "Đang xử lý..."
            : method === "COD"
              ? "Đặt hàng COD"
              : `Thanh toán qua ${method === "MOMO" ? "MoMo" : "VNPay"}`}
        </button>
      </aside>
    </form>
  );
}
