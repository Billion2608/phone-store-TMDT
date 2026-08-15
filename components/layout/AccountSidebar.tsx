import { Heart, LogOut, PackageSearch, UserRound } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
export function AccountSidebar({
  active,
  user,
}: {
  active: "profile" | "orders" | "wishlist";
  user: { fullName: string; email: string };
}) {
  const links = [
    ["profile", "/profile", "Thông tin tài khoản", UserRound],
    ["orders", "/orders", "Đơn hàng", PackageSearch],
    ["wishlist", "/profile/wishlist", "Yêu thích", Heart],
  ] as const;
  return (
    <aside className="h-fit border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <strong className="block text-sm text-gray-900">{user.fullName}</strong>
        <span className="mt-1 block truncate text-xs text-gray-500">
          {user.email}
        </span>
      </div>
      <nav>
        {links.map(([key, href, label, Icon]) => (
          <Link
            className={`flex items-center gap-2 border-b border-gray-100 px-4 py-3 text-sm font-semibold ${active === key ? "border-l-3 border-l-blue-600 bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
            href={href}
            key={key}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-gray-200 p-3">
        <span className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <LogOut size={14} />
          Phiên đăng nhập
        </span>
        <LogoutButton />
      </div>
    </aside>
  );
}
