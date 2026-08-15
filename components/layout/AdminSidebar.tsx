"use client";
import {
  BadgePercent,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FolderTree,
  Image,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Package,
  Smartphone,
  Tags,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
const items = [
  ["Tổng quan", "/admin", LayoutDashboard],
  ["Banner", "/admin/banners", Image],
  ["Sản phẩm", "/admin/products", Package],
  ["Danh mục", "/admin/categories", FolderTree],
  ["Thương hiệu", "/admin/brands", Tags],
  ["Đơn hàng", "/admin/orders", ClipboardList],
  ["Người dùng", "/admin/users", Users],
  ["Mã giảm giá", "/admin/coupons", BadgePercent],
  ["Đánh giá", "/admin/reviews", MessageSquareText],
] as const;
export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const content = (mobile = false) => (
    <>
      <div
        className={`flex h-16 items-center border-b border-white/10 ${collapsed && !mobile ? "justify-center px-2" : "gap-3 px-5"}`}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-[#8c6d53]">
          <Smartphone size={20} />
        </span>
        {collapsed && !mobile ? null : (
          <span>
            <strong className="block text-lg text-white">PhoneStore</strong>
            <small className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#d9cabc]">
              Trung tâm quản trị
            </small>
          </span>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {items.map(([label, href, Icon]) => {
          const active =
            href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              aria-label={label}
              className={`mb-1 flex min-h-11 items-center rounded-lg border border-transparent text-sm font-semibold transition-colors ${collapsed && !mobile ? "justify-center px-2" : "gap-3 px-3"} ${active ? "bg-white text-[#8c6d53] shadow-sm" : "text-[#eee4dc] hover:bg-white/10 hover:text-white"}`}
              href={href}
              key={href}
              onClick={() => setOpen(false)}
              title={collapsed && !mobile ? label : undefined}
            >
              <Icon className="shrink-0" size={18} />
              {collapsed && !mobile ? null : (
                <span className="flex-1">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>
      {collapsed && !mobile ? null : (
        <div className="border-t border-white/10 p-3">
          <Link
            className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#eee4dc] hover:bg-white/10"
            href="/"
          >
            ← Xem cửa hàng
          </Link>
        </div>
      )}
    </>
  );
  return (
    <>
      <button
        aria-label="Mở menu quản trị"
        className="fixed left-3 top-3 z-[65] grid size-10 place-items-center rounded-lg bg-[#8c6d53] text-white lg:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-60 hidden flex-col bg-[#6f523e] transition-[width] duration-200 lg:flex ${collapsed ? "w-20" : "w-64"}`}
      >
        {content()}
        <button
          aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          className="absolute -right-4 top-20 grid size-8 place-items-center rounded-full border border-[#d9cabc] bg-white text-[#6f523e] shadow-sm"
          onClick={onToggle}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </aside>
      {open ? (
        <div className="fixed inset-0 z-[70] bg-black/50 lg:hidden">
          <aside className="flex h-full w-72 flex-col bg-[#6f523e]">
            <button
              aria-label="Đóng menu"
              className="absolute right-3 top-4 grid size-8 place-items-center rounded-md border border-white/20 text-white"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
            {content(true)}
          </aside>
        </div>
      ) : null}
    </>
  );
}
