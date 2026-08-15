"use client";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [developmentUrl, setDevelopmentUrl] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const email = new FormData(event.currentTarget).get("email");
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    setLoading(false);
    setMessage(result.message || "Không thể xử lý yêu cầu.");
    if (response.ok && result.data?.developmentUrl)
      setDevelopmentUrl(result.data.developmentUrl);
  }
  return (
    <form
      autoComplete="off"
      className="w-full max-w-md rounded-xl border border-[#e7dfd5] bg-white p-6 shadow-sm sm:p-8"
      onSubmit={submit}
    >
      <h1 className="text-2xl font-bold text-[#2c221e]">Quên mật khẩu</h1>
      <p className="mt-2 text-sm leading-6 text-[#7d7068]">
        Nhập email đã đăng ký. Liên kết đặt lại mật khẩu có hiệu lực trong 30
        phút.
      </p>
      <label className="form-label mt-6">
        Email
        <input
          autoComplete="email"
          className="form-control"
          name="email"
          placeholder="tenban@email.com"
          required
          type="email"
        />
      </label>
      <button
        className="mt-5 h-11 w-full rounded-md bg-[#8c6d53] font-bold text-white hover:bg-[#6f523e] disabled:bg-[#c7b8ad]"
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : "Gửi hướng dẫn"}
      </button>
      {message ? (
        <p className="mt-4 rounded-md bg-[#f5f2eb] p-3 text-sm leading-6 text-[#6f523e]">
          {message}
        </p>
      ) : null}
      {developmentUrl ? (
        <Link
          className="mt-3 block rounded-md border border-[#d9cabc] p-3 text-center text-sm font-bold text-[#8c6d53]"
          href={developmentUrl}
        >
          Mở liên kết thử nghiệm
        </Link>
      ) : null}
      <Link
        className="mt-5 block text-center text-sm font-bold text-[#8c6d53]"
        href="/login"
      >
        Quay lại đăng nhập
      </Link>
    </form>
  );
}
