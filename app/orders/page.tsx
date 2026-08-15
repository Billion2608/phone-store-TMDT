import {
  ArrowRight,
  CalendarDays,
  PackageSearch,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/layout/AccountSidebar";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { getCurrentUser } from "@/lib/auth";
import { getOrders } from "@/services/order.service";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
export const dynamic = "force-dynamic";
export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");
  const orders = await getOrders(user.id);
  return (
    <div className="bg-[#fdfbf7] pb-12">
      <div className="mx-auto grid max-w-[1280px] gap-5 px-3 py-6 sm:px-4 md:grid-cols-[240px_1fr]">
        <AccountSidebar active="orders" user={user} />
        <main className="min-w-0">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-[#2c221e]">
              Đơn hàng của tôi
            </h1>
            <p className="mt-1 text-sm text-[#7d7068]">
              Theo dõi thanh toán và quá trình giao hàng.
            </p>
          </div>
          {orders.length ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  className="group block rounded-xl border border-[#e7dfd5] bg-white p-4 shadow-sm transition-[border-color,box-shadow] hover:border-[#cdb9a7] hover:shadow-md"
                  href={`/orders/${order.id}`}
                  key={order.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eee8e1] pb-3">
                    <div>
                      <span className="text-xs text-[#7d7068]">
                        Mã đơn hàng
                      </span>
                      <strong className="mt-1 block text-base text-[#8c6d53]">
                        #{order.orderCode}
                      </strong>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4 sm:items-center">
                    <span className="flex items-center gap-2 text-[#61554e]">
                      <CalendarDays size={16} />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="flex items-center gap-2 text-[#61554e]">
                      <PackageSearch size={16} />
                      {order.itemCount} sản phẩm
                    </span>
                    <span className="flex items-center gap-2 text-[#61554e]">
                      <WalletCards size={16} />
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                    <span className="flex items-center justify-between font-bold text-[#d97706] sm:justify-end">
                      {formatCurrency(order.totalAmount)}{" "}
                      <ArrowRight className="ml-2 text-[#8c6d53]" size={17} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#d9cabc] bg-white p-12 text-center">
              <PackageSearch className="mx-auto text-[#b9a99d]" size={44} />
              <h2 className="mt-3 text-lg font-bold">Bạn chưa có đơn hàng</h2>
              <Link
                className="mt-4 inline-flex rounded-md bg-[#8c6d53] px-5 py-2.5 font-bold text-white"
                href="/products"
              >
                Mua sắm ngay
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
