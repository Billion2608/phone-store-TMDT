"use client";
import { ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
const links = [
  ["Trang chủ", "/"],
  ["Tất cả sản phẩm", "/products"],
  ["Điện thoại", "/products?category=dien-thoai"],
  ["Apple", "/products?brand=apple"],
  ["Samsung", "/products?brand=samsung"],
  ["Xiaomi", "/products?brand=xiaomi"],
  ["OPPO", "/products?brand=oppo"],
  ["Phụ kiện", "/products?category=phu-kien"],
  ["Khuyến mãi", "/products?sort=price-asc"],
  ["Đăng nhập", "/login"],
  ["Đăng ký", "/register"],
];
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        aria-expanded={open}
        aria-label="Mở menu"
        className="grid size-9 place-items-center rounded-md border border-white/30 text-white hover:bg-black/10"
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[80] bg-black/50">
          <aside className="flex h-full w-[min(320px,86vw)] flex-col bg-white shadow-xl">
            <header className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
              <strong className="text-lg text-[#cb1c22]">PhoneStore</strong>
              <button
                aria-label="Đóng menu"
                className="grid size-9 place-items-center rounded-md border border-gray-300"
                onClick={() => setOpen(false)}
              >
                <X size={19} />
              </button>
            </header>
            <nav className="flex-1 overflow-y-auto py-2">
              {links.map(([label, href]) => (
                <Link
                  className="flex items-center justify-between border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-[#cb1c22]"
                  href={href}
                  key={`${label}-${href}`}
                  onClick={() => setOpen(false)}
                >
                  <span>{label}</span>
                  <ChevronRight size={15} />
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
              Hotline hỗ trợ:{" "}
              <strong className="text-[#cb1c22]">1900 1234</strong>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
