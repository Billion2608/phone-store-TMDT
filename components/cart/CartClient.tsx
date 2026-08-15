"use client";
import {
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";
import { ProductImage } from "@/components/product/ProductImage";
import type { CartData } from "@/types/cart";
import { formatCurrency } from "@/utils/formatCurrency";
export function CartClient({ initialCart }: { initialCart: CartData }) {
  const [cart, setCart] = useState(initialCart);
  const [busyId, setBusyId] = useState<string | null>(null);
  async function update(id: string, quantity?: number) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/cart/items/${id}`, {
        method: quantity === undefined ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        ...(quantity !== undefined
          ? { body: JSON.stringify({ quantity }) }
          : {}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setCart(result.data);
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể cập nhật giỏ hàng",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setBusyId(null);
    }
  }
  if (!cart.items.length)
    return (
      <div className="rounded-xl border border-dashed border-[#d9cabc] bg-white p-12 text-center">
        <ShoppingBag className="mx-auto text-[#b9a99d]" size={46} />
        <h2 className="mt-4 text-xl font-bold">Giỏ hàng đang trống</h2>
        <p className="mt-1 text-sm text-[#7d7068]">
          Hãy chọn sản phẩm phù hợp với bạn.
        </p>
        <Link
          className="mt-5 inline-flex rounded-md bg-[#8c6d53] px-5 py-2.5 font-bold text-white"
          href="/products"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="overflow-hidden rounded-xl border border-[#e7dfd5] bg-white shadow-sm">
        <div className="hidden grid-cols-[88px_1fr_120px_130px_120px_40px] gap-3 border-b border-[#e7dfd5] bg-[#f5f2eb] px-4 py-3 text-xs font-bold text-[#6f625b] sm:grid">
          <span>Sản phẩm</span>
          <span>Thông tin</span>
          <span>Đơn giá</span>
          <span>Số lượng</span>
          <span>Thành tiền</span>
          <span />
        </div>
        {cart.items.map((item) => (
          <article
            className="grid grid-cols-[88px_1fr] gap-4 border-b border-[#eee8e1] p-4 last:border-0 sm:grid-cols-[88px_1fr_120px_130px_120px_40px] sm:items-center"
            key={item.id}
          >
            <Link href={`/products/${item.productSlug}`}>
              <ProductImage
                alt={item.productName}
                className="aspect-square rounded-md border border-[#eee8e1]"
                src={item.image}
              />
            </Link>
            <div>
              <Link
                className="line-clamp-2 text-sm font-bold text-[#2c221e] hover:text-[#8c6d53]"
                href={`/products/${item.productSlug}`}
              >
                {item.productName}
              </Link>
              <p className="mt-1 text-xs text-[#7d7068]">
                {item.attributes
                  .map((attribute) => attribute.value)
                  .join(" · ") || item.sku}
              </p>
              <p className="mt-1 text-xs text-[#a09188]">Còn {item.stock}</p>
            </div>
            <p className="col-start-2 text-sm font-bold text-[#d97706] sm:col-auto">
              {formatCurrency(item.price)}
            </p>
            <div className="col-start-2 flex w-fit overflow-hidden rounded-md border border-[#d9cabc] sm:col-auto">
              <button
                aria-label="Giảm số lượng"
                className="grid size-9 place-items-center hover:bg-[#f5f2eb]"
                disabled={busyId === item.id || item.quantity <= 1}
                onClick={() => update(item.id, item.quantity - 1)}
              >
                <Minus size={14} />
              </button>
              <span className="grid w-9 place-items-center border-x border-[#d9cabc] text-sm font-bold">
                {item.quantity}
              </span>
              <button
                aria-label="Tăng số lượng"
                className="grid size-9 place-items-center hover:bg-[#f5f2eb]"
                disabled={busyId === item.id || item.quantity >= item.stock}
                onClick={() => update(item.id, item.quantity + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
            <strong className="col-start-2 text-sm sm:col-auto">
              {formatCurrency(item.subtotal)}
            </strong>
            <button
              className="col-start-2 text-left text-[#a09188] hover:text-rose-600 sm:col-auto"
              disabled={busyId === item.id}
              onClick={() => update(item.id)}
              aria-label="Xóa sản phẩm"
            >
              <Trash2 size={18} />
            </button>
          </article>
        ))}
      </section>
      <aside className="h-fit rounded-xl border border-[#e7dfd5] bg-white p-5 shadow-sm lg:sticky lg:top-32">
        <h2 className="border-b border-[#e7dfd5] pb-4 text-xl font-bold">
          Tóm tắt đơn hàng
        </h2>
        <div className="mt-4 flex justify-between text-sm text-[#61554e]">
          <span>{cart.itemCount} sản phẩm</span>
          <span>{formatCurrency(cart.subtotal)}</span>
        </div>
        <div className="mt-4 flex justify-between border-t border-[#eee8e1] pt-4">
          <strong>Tạm tính</strong>
          <strong className="text-2xl text-[#d97706]">
            {formatCurrency(cart.subtotal)}
          </strong>
        </div>
        <div className="mt-4 space-y-2 rounded-lg bg-[#fdfbf7] p-3 text-xs text-[#6f625b]">
          <p className="flex gap-2">
            <Truck size={15} /> Miễn phí vận chuyển cho đơn đủ điều kiện
          </p>
          <p className="flex gap-2">
            <ShieldCheck size={15} /> Thanh toán và tồn kho được xác minh an
            toàn
          </p>
        </div>
        <Link
          className="mt-5 flex h-12 items-center justify-center rounded-md bg-[#8c6d53] font-bold text-white hover:bg-[#6f523e]"
          href="/checkout"
        >
          Tiến hành thanh toán
        </Link>
        <Link
          className="mt-2 flex h-10 items-center justify-center text-sm font-semibold text-[#8c6d53]"
          href="/products"
        >
          Tiếp tục mua sắm
        </Link>
      </aside>
    </div>
  );
}
