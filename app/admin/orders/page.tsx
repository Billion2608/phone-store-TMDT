import Link from "next/link";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { getAdminOrders } from "@/services/admin.service";
import type { OrderStatus } from "@/types/order";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const statuses: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "SHIPPING",
    "COMPLETED",
    "CANCELLED",
  ];
  const valid = statuses.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : undefined;
  const orders = await getAdminOrders({ status: valid, search: params.search });
  return (
    <div>
      <h1 className="admin-page-title">Đơn hàng</h1>
      <p className="admin-page-subtitle">
        Theo dõi và xử lý đơn theo đúng quy trình.
      </p>
      <form className="admin-card mt-6 flex flex-wrap gap-3">
        <input
          className="form-control mt-0 max-w-sm"
          defaultValue={params.search}
          name="search"
          placeholder="Mã đơn, người nhận, số điện thoại"
        />
        <select
          className="form-control mt-0 max-w-52"
          defaultValue={valid ?? ""}
          name="status"
        >
          <option value="">Tất cả trạng thái</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <button className="admin-primary-button">Lọc</button>
      </form>
      <section className="admin-card mt-6">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.code}</strong>
                  </td>
                  <td>
                    {order.customer}
                    <small className="block text-slate-400">
                      {order.email}
                    </small>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{order.itemCount}</td>
                  <td>{formatCurrency(order.total)}</td>
                  <td>
                    {PAYMENT_STATUS_LABELS[order.paymentStatus] ??
                      order.paymentStatus}
                  </td>
                  <td>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td>
                    <Link
                      className="rounded-md bg-[#f5f2eb] px-3 py-2 text-xs font-bold text-[#8c6d53]"
                      href={`/admin/orders/${order.id}`}
                    >
                      Chi tiết
                    </Link>
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
