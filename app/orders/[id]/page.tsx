import { Check, ChevronLeft, MapPin, Phone, ReceiptText } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AccountSidebar } from "@/components/layout/AccountSidebar";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { ProductImage } from "@/components/product/ProductImage";
import { ReviewForm } from "@/components/review/ReviewForm";
import { getCurrentUser } from "@/lib/auth";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getOrderDetail } from "@/services/order.service";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
export const dynamic = "force-dynamic";
export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;
  const query = await searchParams;
  if (!user) redirect(`/login?next=/orders/${id}`);
  if (!/^\d+$/.test(id)) notFound();
  const order = await getOrderDetail(user.id, id);
  if (!order) notFound();
  const stages = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED"] as const;
  return (
    <div className="bg-[#fdfbf7] pb-12">
      <div className="mx-auto grid max-w-[1280px] gap-5 px-3 py-6 sm:px-4 md:grid-cols-[240px_1fr]">
        <AccountSidebar active="orders" user={user} />
        <main className="min-w-0">
          <Link
            className="inline-flex items-center gap-1 text-sm font-bold text-[#8c6d53]"
            href="/orders"
          >
            <ChevronLeft size={16} /> Quay lại đơn hàng
          </Link>
          {query.payment ? (
            <div
              className={`mt-4 rounded-lg border p-3 text-sm font-semibold ${query.payment === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
            >
              {query.payment === "success"
                ? "Thanh toán VNPay thành công."
                : "Thanh toán VNPay chưa thành công. Đơn hàng đã được lưu để bạn theo dõi."}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[#2c221e]">
                Đơn #{order.orderCode}
              </h1>
              <p className="mt-1 text-sm text-[#7d7068]">
                Đặt ngày {formatDate(order.createdAt)}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <section className="mt-5 rounded-xl border border-[#e7dfd5] bg-white p-5 shadow-sm">
            <h2 className="border-b border-[#eee8e1] pb-4 font-bold">
              Tiến trình đơn hàng
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stages.map((stage, index) => {
                const entry = order.timeline.find(
                  (item) => item.status === stage,
                );
                return (
                  <div className="relative" key={stage}>
                    <div className="flex items-center">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-full ${entry ? "bg-[#8c6d53] text-white" : "bg-[#eee8e1] text-[#a09188]"}`}
                      >
                        {entry ? <Check size={17} /> : index + 1}
                      </span>
                      <span className="hidden h-0.5 flex-1 bg-[#eee8e1] sm:block" />
                    </div>
                    <strong
                      className={`mt-2 block text-sm ${entry ? "text-[#2c221e]" : "text-[#9a8c83]"}`}
                    >
                      {ORDER_STATUS_LABELS[stage]}
                    </strong>
                    <span className="text-xs text-[#a09188]">
                      {entry ? formatDate(entry.createdAt) : "Chưa cập nhật"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px]">
            <section className="overflow-hidden rounded-xl border border-[#e7dfd5] bg-white shadow-sm">
              <h2 className="border-b border-[#eee8e1] p-4 font-bold">
                Sản phẩm ({order.itemCount})
              </h2>
              {order.items.map((item) => (
                <article
                  className="grid grid-cols-[84px_1fr] gap-4 border-b border-[#eee8e1] p-4 last:border-0"
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
                      className="text-sm font-bold hover:text-[#8c6d53]"
                      href={`/products/${item.productSlug}`}
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-xs text-[#7d7068]">
                      {item.variantName || item.sku}
                    </p>
                    <p className="mt-2 text-xs">
                      {formatCurrency(item.price)} × {item.quantity}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <strong className="text-[#d97706]">
                        {formatCurrency(item.totalPrice)}
                      </strong>
                      {item.canReview ? (
                        <ReviewForm
                          orderItemId={item.id}
                          productName={item.productName}
                        />
                      ) : item.reviewId ? (
                        <span className="text-xs font-bold text-emerald-600">
                          Đã đánh giá
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </section>
            <aside className="space-y-4">
              <section className="rounded-xl border border-[#e7dfd5] bg-white p-5 shadow-sm">
                <h2 className="border-b border-[#eee8e1] pb-3 font-bold">
                  Thông tin nhận hàng
                </h2>
                <p className="mt-3 font-bold">{order.receiverName}</p>
                <p className="mt-2 flex gap-2 text-sm text-[#61554e]">
                  <Phone size={16} />
                  {order.receiverPhone}
                </p>
                <p className="mt-2 flex gap-2 text-sm leading-6 text-[#61554e]">
                  <MapPin className="shrink-0" size={16} />
                  {order.shippingAddress}
                </p>
              </section>
              <section className="rounded-xl border border-[#e7dfd5] bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 border-b border-[#eee8e1] pb-3 font-bold">
                  <ReceiptText size={18} /> Thanh toán
                </h2>
                <div className="mt-3 space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Phí giao hàng</span>
                    <span>{formatCurrency(order.shippingFee)}</span>
                  </p>
                  <p className="flex justify-between border-t border-[#eee8e1] pt-3 font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-xl text-[#d97706]">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </p>
                  <p className="rounded-md bg-[#f5f2eb] p-2 text-xs text-[#6f523e]">
                    {order.paymentMethod} · {order.paymentStatus}
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
