"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export function LoginForm({ nextPath = "/" }: { nextPath?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công",
        timer: 900,
        showConfirmButton: false,
      });
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Đăng nhập thất bại",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
      setLoading(false);
    }
  }

  return (
    <form
      autoComplete="off"
      className="w-full max-w-sm rounded-lg border border-[#e7dfd5] bg-white p-5 shadow-sm sm:p-6"
      onSubmit={submit}
    >
      <Link className="mx-auto flex w-fit items-center gap-2.5" href="/">
        <Image
          alt="PhoneStore"
          className="size-10 rounded-md border border-[#e7dfd5] object-cover"
          height={40}
          src="/images/brand/phonestore-logo.png"
          width={40}
        />
        <span>
          <strong className="block text-lg leading-tight text-[#2c221e]">
            PhoneStore
          </strong>
          <small className="text-[11px] text-[#8c6d53]">
            Điện thoại và phụ kiện chính hãng
          </small>
        </span>
      </Link>
      <div className="my-4 border-t border-[#eee8e1]" />
      <h1 className="text-center text-xl font-bold text-[#2c221e]">
        Đăng nhập
      </h1>
      <p className="mt-1 text-center text-sm text-[#7d7068]">
        Đăng nhập để theo dõi đơn hàng.
      </p>
      <label className="form-label mt-5">
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
      <label className="form-label mt-3">
        Mật khẩu
        <input
          autoComplete="current-password"
          className="form-control"
          minLength={6}
          name="password"
          placeholder="Nhập mật khẩu"
          required
          type="password"
        />
      </label>
      <div className="mt-2 text-right">
        <Link
          className="text-xs font-bold text-[#8c6d53] hover:text-[#d97706]"
          href="/forgot-password"
        >
          Quên mật khẩu?
        </Link>
      </div>
      <button
        className="mt-4 h-10 w-full rounded-md bg-[#8c6d53] text-sm font-bold text-white transition-colors hover:bg-[#6f523e] disabled:bg-[#c7b8ad]"
        disabled={loading}
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
      <p className="mt-4 text-center text-sm text-[#7d7068]">
        Chưa có tài khoản?{" "}
        <Link
          className="font-bold text-[#8c6d53] hover:text-[#d97706]"
          href="/register"
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
