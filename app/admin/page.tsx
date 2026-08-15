import { Banknote, Package, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { getDashboard } from "@/services/admin.service";
import type { OrderStatus } from "@/types/order";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
export default async function AdminDashboard() {
  const data = await getDashboard();
  const cards = [
    [
      "Doanh thu",
      formatCurrency(data.revenue),
      Banknote,
      "border-l-emerald-500 text-emerald-600",
    ],
    [
      "Đơn hàng",
      String(data.totalOrders),
      ShoppingCart,
      "border-l-[#8c6d53] text-[#8c6d53]",
    ],
    [
      "Sản phẩm",
      String(data.totalProducts),
      Package,
      "border-l-[#d97706] text-[#d97706]",
    ],
    [
      "Khách hàng",
      String(data.totalCustomers),
      Users,
      "border-l-amber-500 text-amber-600",
    ],
  ] as const;
  const statuses: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "SHIPPING",
    "COMPLETED",
    "CANCELLED",
  ];
  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Tổng quan cửa hàng</h1>
          <p className="admin-page-subtitle">
            Dữ liệu tổng hợp trực tiếp từ hệ thống.
          </p>
        </div>
        <Link className="admin-primary-button" href="/admin/banners">
          Cập nhật banner
        </Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, color]) => (
          <div
            className={`admin-card flex items-center gap-3 border-l-4 ${color}`}
            key={label}
          >
            <Icon size={22} />
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <strong className="text-xl text-gray-900">{value}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_300px]">
        <section className="admin-card">
          <div className="flex items-center justify-between border-b border-[#e7dfd5] pb-3">
            <h2 className="admin-section-title">Đơn hàng gần đây</h2>
            <Link
              className="text-xs font-bold text-[#8c6d53]"
              href="/admin/orders"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="admin-table-wrap mt-3">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link
                        className="font-bold text-[#8c6d53]"
                        href={`/admin/orders/${order.id}`}
                      >
                        {order.code}
                      </Link>
                    </td>
                    <td>{order.customer}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="admin-card">
          <h2 className="border-b border-[#e7dfd5] pb-3 admin-section-title">
            Theo trạng thái
          </h2>
          <div className="mt-3 divide-y divide-[#eee8e1]">
            {statuses.map((status) => (
              <div
                className="flex items-center justify-between py-2.5"
                key={status}
              >
                <span className="text-xs font-semibold text-gray-600">
                  {ORDER_STATUS_LABELS[status]}
                </span>
                <strong className="min-w-8 rounded-sm bg-[#f5f2eb] px-2 py-1 text-center text-xs">
                  {data.statuses[status] ?? 0}
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
