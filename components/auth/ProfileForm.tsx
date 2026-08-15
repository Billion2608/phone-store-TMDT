"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { AddressFields } from "@/components/address/AddressFields";
export function ProfileForm({
  user,
  address,
}: {
  user: { fullName: string; email: string; phone: string | null };
  address: { province: string; district: string; ward: string; address: string };
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          phone: form.get("phone"),
          province: form.get("province"),
          district: form.get("district"),
          ward: form.get("ward"),
          address: form.get("address"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      await Swal.fire({
        icon: "success",
        title: "Đã cập nhật thông tin",
        timer: 900,
        showConfirmButton: false,
      });
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể cập nhật",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <form autoComplete="off" className="mt-5 max-w-2xl" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="form-label sm:col-span-2">
          Họ và tên
          <input
            className="form-control"
            defaultValue={user.fullName}
            name="fullName"
            required
          />
        </label>
        <label className="form-label">
          Email
          <input
            className="form-control bg-[#f5f2eb] text-[#7d7068]"
            disabled
            value={user.email}
          />
        </label>
        <label className="form-label">
          Số điện thoại
          <input
            className="form-control"
            defaultValue={user.phone ?? ""}
            name="phone"
            required
          />
        </label>
        <div className="border-t border-[#eee8e1] pt-4 sm:col-span-2">
          <h2 className="font-bold">Địa chỉ mặc định</h2>
          <p className="mt-1 text-xs text-[#7d7068]">Địa chỉ này sẽ được điền sẵn khi thanh toán.</p>
        </div>
        <AddressFields initial={address} />
      </div>
      <p className="mt-3 text-xs text-[#7d7068]">
        Email đăng nhập không thể thay đổi tại đây.
      </p>
      <button
        className="mt-5 min-h-10 rounded-md bg-[#8c6d53] px-6 text-sm font-bold text-white hover:bg-[#6f523e] disabled:opacity-60"
        disabled={saving}
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
