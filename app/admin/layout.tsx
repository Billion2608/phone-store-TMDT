"use client";

import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f5f0]">
      {/* SIDEBAR BÊN TRÁI */}
      <aside className="w-64 bg-[#5c4738] text-white flex flex-col justify-between p-4">
        <div>
          {/* Logo & Header Sidebar */}
          <div className="flex items-center gap-3 p-2 mb-6">
            <div className="bg-white text-[#5c4738] p-2 rounded-lg font-bold">📱</div>
            <div>
              <h2 className="font-bold text-base">PhoneStore</h2>
              <p className="text-[10px] text-amber-200 uppercase tracking-wider">Trung tâm quản trị</p>
            </div>
          </div>

          {/* Menu điều hướng */}
          <nav className="space-y-1">
            <a href="/admin" className="flex items-center gap-3 px-3 py-2 bg-white text-[#5c4738] rounded-md font-semibold">
              <span>📊</span> Tổng quan
            </a>
            <a href="/admin/banners" className="flex items-center gap-3 px-3 py-2 text-amber-100 hover:bg-[#4a392d] rounded-md">
              <span>🖼️</span> Banner
            </a>
            <a href="/admin/products" className="flex items-center gap-3 px-3 py-2 text-amber-100 hover:bg-[#4a392d] rounded-md">
              <span>📦</span> Sản phẩm
            </a>
            <a href="/admin/categories" className="flex items-center gap-3 px-3 py-2 text-amber-100 hover:bg-[#4a392d] rounded-md">
              <span>📁</span> Danh mục
            </a>
            <a href="/admin/brands" className="flex items-center gap-3 px-3 py-2 text-amber-100 hover:bg-[#4a392d] rounded-md">
              <span>🏷️</span> Thương hiệu
            </a>
            <a href="/admin/orders" className="flex items-center gap-3 px-3 py-2 text-amber-100 hover:bg-[#4a392d] rounded-md">
              <span>📄</span> Đơn hàng
            </a>
            <a href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-amber-100 hover:bg-[#4a392d] rounded-md">
              <span>👥</span> Người dùng
            </a>
            <a href="/admin/coupons" className="flex items-center gap-3 px-3 py-2 text-amber-100 hover:bg-[#4a392d] rounded-md">
              <span>🎟️</span> Mã giảm giá
            </a>
            <a href="/admin/reviews" className="flex items-center gap-3 px-3 py-2 text-amber-100 hover:bg-[#4a392d] rounded-md">
              <span>💬</span> Đánh giá
            </a>
          </nav>
        </div>

        {/* PHẦN DƯỚI CÙNG SIDEBAR */}
        <div className="space-y-2 border-t border-amber-900/50 pt-3">
          <a href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-amber-100 hover:text-white">
            ← Xem cửa hàng
          </a>

          {/* NÚT ĐĂNG XUẤT (Vị trí 1: Sidebar) */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-300 hover:bg-red-900/30 hover:text-red-100 rounded-md transition-colors cursor-pointer"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH */}
      <div className="flex-1 flex flex-col">
        {/* HEADER GÓC TRÊN */}
        <header className="flex items-center justify-between px-8 py-4 bg-[#f7f5f0] border-b border-gray-200/60">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Bảng điều khiển</h1>
            <p className="text-xs text-gray-500">Quản lý hoạt động cửa hàng</p>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm nhanh..."
              className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg w-64 focus:outline-none"
            />
            <button className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600">🏠</button>
            <button className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600">🔔</button>

            {/* THÔNG TIN ADMIN & NÚT ĐĂNG XUẤT (Vị trí 2: Top Header) */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-300">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold border border-amber-200">
                🛡️
              </div>
              <div className="text-xs">
                <p className="text-gray-400">Quản trị viên</p>
                <p className="font-bold text-gray-800">Administrator</p>
              </div>

              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-100/80 hover:bg-red-200 rounded-lg border border-red-200 transition-colors cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        {/* NỘI DUNG TRANG */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
