import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { ProductImage } from "@/components/product/ProductImage";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import { getAdminOrder } from "@/services/admin.service";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const order = await getAdminOrder(id);
  if (!order) notFound();
  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Đơn {order.code}</h1>
          <p className="admin-page-subtitle">
            {formatDate(order.createdAt)} · {order.customer.name}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="admin-card">
            <h2 className="admin-section-title">Sản phẩm</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div
                  className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-[#eee8e1] pb-3 last:border-0"
                  key={item.id}
                >
                  <ProductImage
                    alt={item.name}
                    className="aspect-square rounded-lg"
                    src={item.image}
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <p className="text-xs text-[#7d7068]">
                      {item.variant || item.sku} · {formatCurrency(item.price)}{" "}
                      × {item.quantity}
                    </p>
                  </div>
                  <strong>{formatCurrency(item.total)}</strong>
                </div>
              ))}
            </div>
          </section>
          <section className="admin-card">
            <h2 className="admin-section-title">Lịch sử trạng thái</h2>
            <div className="mt-4 space-y-4">
              {order.history.map((item) => (
                <div className="border-l-2 border-[#d97706] pl-4" key={item.id}>
                  <strong>
                    {item.oldStatus
                      ? (ORDER_STATUS_LABELS[
                          item.oldStatus as keyof typeof ORDER_STATUS_LABELS
                        ] ?? item.oldStatus)
                      : "Mới tạo"}{" "}
                    →{" "}
                    {ORDER_STATUS_LABELS[
                      item.newStatus as keyof typeof ORDER_STATUS_LABELS
                    ] ?? item.newStatus}
                  </strong>
                  <p className="text-xs text-[#7d7068]">
                    {formatDate(item.createdAt)} ·{" "}
                    {item.changedBy === "Hệ thống"
                      ? "Hệ thống"
                      : item.changedBy}
                  </p>
                  {item.note ? (
                    <p className="mt-1 text-sm">{item.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="space-y-6">
          <section className="admin-card">
            <h2 className="admin-section-title">Cập nhật trạng thái</h2>
            <div className="mt-4">
              <OrderStatusForm current={order.status} id={id} />
            </div>
          </section>
          <section className="admin-card">
            <h2 className="admin-section-title">Thông tin giao hàng</h2>
            <p className="mt-3 font-bold">{order.receiverName}</p>
            <p className="text-sm text-[#7d7068]">{order.receiverPhone}</p>
            <p className="mt-2 text-sm leading-6">{order.shippingAddress}</p>
          </section>
          <section className="admin-card">
            <h2 className="admin-section-title">Thanh toán</h2>
            <div className="mt-3 space-y-2 text-sm">
              <p className="flex justify-between">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </p>
              <p className="flex justify-between">
                <span>Giảm giá</span>
                <span>-{formatCurrency(order.discount)}</span>
              </p>
              <p className="flex justify-between">
                <span>Vận chuyển</span>
                <span>{formatCurrency(order.shippingFee)}</span>
              </p>
              <p className="flex justify-between border-t border-[#eee8e1] pt-2 text-lg font-black">
                <span>Tổng cộng</span>
                <span>{formatCurrency(order.total)}</span>
              </p>
              <p className="rounded-md bg-[#f5f2eb] p-2 text-xs text-[#6f523e]">
                {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                  order.paymentMethod}{" "}
                ·{" "}
                {PAYMENT_STATUS_LABELS[order.paymentStatus] ??
                  order.paymentStatus}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
