"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-red-600 hover:border-red-300"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut size={16} />
      {loading ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
