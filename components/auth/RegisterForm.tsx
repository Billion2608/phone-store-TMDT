"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const payload = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({
        icon: "success",
        title: "Đăng ký thành công",
        text: "Bạn có thể đăng nhập ngay.",
      });
      router.push("/login");
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Đăng ký thất bại",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
      setLoading(false);
    }
  }
  return (
    <form
      autoComplete="off"
      className="w-full max-w-xl rounded-xl border border-[#e7dfd5] bg-white p-6 shadow-sm sm:p-8"
      onSubmit={submit}
    >
      <Link className="mx-auto flex w-fit items-center gap-3" href="/">
        <Image
          alt="PhoneStore"
          className="size-12 rounded-lg border border-[#e7dfd5] object-cover"
          height={48}
          src="/images/brand/phonestore-logo.png"
          width={48}
        />
        <span>
          <strong className="block text-xl text-[#2c221e]">PhoneStore</strong>
          <small className="text-xs text-[#8c6d53]">
            Tạo tài khoản mua sắm
          </small>
        </span>
      </Link>
      <div className="my-6 border-t border-[#eee8e1]" />
      <h1 className="text-center text-2xl font-bold text-[#2c221e]">
        Đăng ký tài khoản
      </h1>
      <p className="mt-2 text-center text-sm text-[#7d7068]">
        Thông tin của bạn được dùng để giao hàng và hỗ trợ đơn hàng.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="form-label sm:col-span-2">
          Họ và tên
          <input
            autoComplete="name"
            className="form-control"
            name="fullName"
            required
          />
        </label>
        <label className="form-label">
          Email
          <input
            autoComplete="email"
            className="form-control"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="form-label">
          Số điện thoại
          <input
            autoComplete="tel"
            className="form-control"
            name="phone"
            required
          />
        </label>
        <label className="form-label">
          Mật khẩu
          <input
            autoComplete="new-password"
            className="form-control"
            minLength={6}
            name="password"
            required
            type="password"
          />
        </label>
        <label className="form-label">
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
      </div>
      <button
        className="mt-6 h-11 w-full rounded-md bg-[#8c6d53] font-bold text-white transition-colors hover:bg-[#6f523e] disabled:bg-[#c7b8ad]"
        disabled={loading}
      >
        {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
      </button>
      <p className="mt-5 text-center text-sm text-[#7d7068]">
        Đã có tài khoản?{" "}
        <Link
          className="font-bold text-[#8c6d53] hover:text-[#d97706]"
          href="/login"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
