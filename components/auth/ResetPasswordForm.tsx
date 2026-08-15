"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: form.get("password"),
          confirmPassword: form.get("confirmPassword"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({ icon: "success", title: "Đã đổi mật khẩu" });
      router.push("/login");
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể đổi mật khẩu",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
      setLoading(false);
    }
  }
  if (!token)
    return (
      <div className="w-full max-w-md rounded-xl border border-[#e7dfd5] bg-white p-8 text-center">
        <h1 className="text-xl font-bold">Liên kết không hợp lệ</h1>
        <Link
          className="mt-5 inline-block font-bold text-[#8c6d53]"
          href="/forgot-password"
        >
          Yêu cầu liên kết mới
        </Link>
      </div>
    );
  return (
    <form
      autoComplete="off"
      className="w-full max-w-md rounded-xl border border-[#e7dfd5] bg-white p-6 shadow-sm sm:p-8"
      onSubmit={submit}
    >
      <h1 className="text-2xl font-bold text-[#2c221e]">Đặt mật khẩu mới</h1>
      <p className="mt-2 text-sm text-[#7d7068]">
        Mật khẩu cần có ít nhất 6 ký tự.
      </p>
      <label className="form-label mt-6">
        Mật khẩu mới
        <input
          autoComplete="new-password"
          className="form-control"
          minLength={6}
          name="password"
          required
          type="password"
        />
      </label>
      <label className="form-label mt-4">
        Xác nhận mật khẩu
        <input
          autoComplete="new-password"
          className="form-control"
          minLength={6}
          name="confirmPassword"
          required
          type="password"
        />
      </label>
      <button
        className="mt-6 h-11 w-full rounded-md bg-[#8c6d53] font-bold text-white hover:bg-[#6f523e] disabled:bg-[#c7b8ad]"
        disabled={loading}
      >
        {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
