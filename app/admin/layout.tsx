"use client";

import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 1. Gọi API xóa cookie/session
      await fetch("/api/auth/logout", { method: "POST" });
      
      // 2. Xóa thông tin lưu trong localStorage (nếu có)
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // 3. Chuyển hướng về trang Đăng nhập
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar bên trái giữ nguyên */}
      
      <div className="flex-1 flex flex-col">
        {/* Header trên cùng */}
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-800">Bảng điều khiển</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Thông tin Admin */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-xs">
                🛡️
              </div>
              <div className="text-sm">
                <p className="text-[10px] text-gray-500 leading-none">Quản trị viên</p>
                <p className="font-semibold text-gray-800 leading-tight">Administrator</p>
              </div>
            </div>

            {/* NÚT ĐĂNG XUẤT */}
            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              🚪 Đăng xuất
            </button>
          </div>
        </header>

        {/* Nội dung các trang admin con */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
