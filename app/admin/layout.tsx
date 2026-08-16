"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Gọi API xóa Cookie phía Server và đợi phản hồi hoàn tất
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Lỗi khi gọi API đăng xuất:", error);
    } finally {
      // 2. Xóa sạch bộ nhớ tạm phía Client
      try {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
        });
      } catch (e) {
        console.error("Lỗi dọn dẹp storage:", e);
      }

      // 3. Chuyển hướng sang trang Login và làm mới Router
      router.push("/login");
      router.refresh();
    }
  };

  const navItems = [
    { name: "Tổng quan", href: "/admin", icon: "📊" },
    { name: "Banner", href: "/admin/banners", icon: "🖼️" },
    { name: "Sản phẩm", href: "/admin/products", icon: "📦" },
    { name: "Danh mục", href: "/admin/categories", icon: "📁" },
    { name: "Thương hiệu", href: "/admin/brands", icon: "🏷️" },
    { name: "Đơn hàng", href: "/admin/orders", icon: "📄" },
    { name: "Người dùng", href: "/admin/users", icon: "👥" },
    { name: "Mã giảm giá", href: "/admin/coupons", icon: "🎟️" },
    { name: "Đánh giá", href: "/admin/reviews", icon: "💬" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f7f5f0]">
      {/* KHUNG MENU BÊN TRÁI (SIDEBAR) */}
      <aside className="w-64 bg-[#5c4738] text-white flex flex-col justify-between shrink-0 min-h-screen">
        <div>
          {/* Logo & Tiêu đề */}
          <div className="p-5 border-b border-[#6e5645] flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-[#5c4738] rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
              📱
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">PhoneStore</h1>
              <p className="text-[10px] text-amber-200 tracking-wider uppercase font-semibold">
                TRUNG TÂM QUẢN TRỊ
              </p>
            </div>
          </div>

          {/* Danh sách Menu */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-amber-100 hover:bg-[#4a392d] hover:text-white transition-all"
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Chân Menu */}
        <div className="p-3 border-t border-[#6e5645] space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 text-sm text-amber-200 hover:text-white transition-colors"
          >
            ← Xem cửa hàng
          </Link>

          {/* Nút Đăng xuất Sidebar */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer text-left"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* KHUNG NỘI DUNG CHÍNH (Bên phải) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Thanh Header trên cùng */}
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Bảng điều khiển</h2>
            <p className="text-xs text-gray-500">Quản lý hoạt động cửa hàng</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Ô tìm kiếm */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg w-64 focus:outline-none focus:bg-white"
              />
              <span className="absolute left-3 top-2 text-xs text-gray-400">🔍</span>
            </div>

            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 text-sm"
              title="Về trang chủ"
            >
              🏠
            </Link>
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 text-sm" title="Thông báo">
              🔔
            </button>

            {/* Khối Admin + Nút Đăng xuất Header */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-xs font-bold text-amber-800">
                🛡️
              </div>
              <div className="text-xs">
                <p className="text-gray-400 text-[10px]">Quản trị viên</p>
                <p className="font-bold text-gray-800">Administrator</p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="ml-2 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>🚪</span> Đăng xuất
              </button>
            </div>
          </div>
        </header>

        {/* Nội dung các trang con */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
