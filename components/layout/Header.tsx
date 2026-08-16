import { cookies } from "next/headers";
import Link from "next/link";
import { User, LogOut, ShieldAlert, ShoppingBag } from "lucide-react";

export async function AccountNav() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const userCookie = cookieStore.get("user")?.value;
  const userRole = cookieStore.get("user_role")?.value;

  let user = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      user = null;
    }
  }

  // CHƯA ĐĂNG NHẬP: Hiển thị nút "Tài khoản" dẫn đến trang /login
  if (!token || !user) {
    return (
      <Link href="/login" className="header-action flex items-center gap-1.5">
        <User size={18} />
        <span className="hidden xl:inline">Tài khoản</span>
      </Link>
    );
  }

  // ĐÃ ĐĂNG NHẬP: Hiển thị tên người dùng và menu xổ xuống
  const isAdmin = userRole === "ADMIN" || userRole === "MANAGER";

  return (
    <div className="relative group">
      <Link
        href={isAdmin ? "/admin" : "/profile"}
        className="header-action flex items-center gap-1.5"
      >
        <User size={18} />
        <span className="hidden max-w-[110px] truncate xl:inline">
          {user.name || "Tài khoản"}
        </span>
      </Link>

      {/* Menu xổ xuống khi rê chuột vào */}
      <div className="absolute right-0 top-full z-50 hidden w-48 rounded-md border border-[#e7dfd5] bg-white p-1.5 shadow-lg group-hover:block text-[#2c221e]">
        <div className="border-b border-[#eee8e1] px-3 py-2">
          <p className="truncate text-xs font-bold">{user.name}</p>
          <p className="truncate text-[11px] text-[#7d7068]">{user.email}</p>
        </div>

        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded px-3 py-2 text-xs font-semibold text-[#8c6d53] hover:bg-[#f7f4f0]"
          >
            <ShieldAlert size={14} /> Trang Quản trị
          </Link>
        )}

        <Link
          href="/profile/orders"
          className="flex items-center gap-2 rounded px-3 py-2 text-xs hover:bg-[#f7f4f0]"
        >
          <ShoppingBag size={14} /> Đơn hàng của tôi
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-2 rounded px-3 py-2 text-xs hover:bg-[#f7f4f0]"
        >
          <User size={14} /> Tài khoản của tôi
        </Link>

        <a
          href="/api/auth/logout"
          className="flex items-center gap-2 rounded px-3 py-2 text-xs text-red-600 hover:bg-red-50"
        >
          <LogOut size={14} /> Đăng xuất
        </a>
      </div>
    </div>
  );
}
