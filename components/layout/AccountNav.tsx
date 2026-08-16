import { cookies } from "next/headers";
import Link from "next/link";
import { User, LogOut, ShieldAlert, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function AccountNav() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // 1. Kiểm tra Cookie token
  if (!token) {
    return (
      <Link href="/login" className="header-action flex items-center gap-1.5">
        <User size={18} />
        <span className="hidden xl:inline">Tài khoản</span>
      </Link>
    );
  }

  let user = null;

  try {
    // Ép kiểu ID linh hoạt để không bị crash Prisma (hỗ trợ cả Int, BigInt và String)
    const numericId = Number(token);
    const isNumber = !isNaN(numericId);

    user = await prisma.users.findFirst({
      where: {
        OR: [
          ...(isNumber ? [{ id: numericId as any }] : []),
          ...(isNumber ? [{ id: BigInt(token) as any }] : []),
          { id: token as any },
        ],
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin user trong AccountNav:", error);
  }

  // 2. Nếu không tìm thấy User trong Database
  if (!user) {
    return (
      <Link href="/login" className="header-action flex items-center gap-1.5">
        <User size={18} />
        <span className="hidden xl:inline">Tài khoản</span>
      </Link>
    );
  }

  // 3. Đã xác thực thành công
  const userRole = (user.role || "").toUpperCase();
  const isAdmin = userRole === "ADMIN" || userRole === "MANAGER";
  const displayName = user.full_name || user.email;

  return (
    <div className="relative group">
      <Link
        href={isAdmin ? "/admin" : "/profile"}
        className="header-action flex items-center gap-1.5"
      >
        <User size={18} />
        <span className="hidden max-w-[110px] truncate xl:inline">
          {displayName}
        </span>
      </Link>

      {/* Menu dropdown khi hover */}
      <div className="absolute right-0 top-full z-50 hidden w-48 rounded-md border border-[#e7dfd5] bg-white p-1.5 shadow-lg group-hover:block text-[#2c221e]">
        <div className="border-b border-[#eee8e1] px-3 py-2">
          <p className="truncate text-xs font-bold">{displayName}</p>
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
