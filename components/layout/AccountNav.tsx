import { LogIn, UserRound } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export async function AccountNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link className="header-action hidden xl:flex" href="/login">
        <LogIn size={18} />
        <span>Tài khoản</span>
      </Link>
    );
  }

  return (
    <Link
      className="header-action hidden xl:flex"
      href={user.role === "ADMIN" ? "/admin" : "/profile"}
    >
      <UserRound size={18} />
      <span className="max-w-24 truncate">{user.fullName}</span>
    </Link>
  );
}