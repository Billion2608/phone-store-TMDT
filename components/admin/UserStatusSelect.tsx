"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
export function UserStatusSelect({
  id,
  status,
  role,
  disabled,
  mode,
}: {
  id: string;
  status: string;
  role: string;
  disabled: boolean;
  mode: "role" | "status";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  async function update(body: Record<string, string>) {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "warning",
        title: "Không thể cập nhật quyền",
        text: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  }
  const locked = disabled || saving;
  if (mode === "role")
    return (
      <div className="flex flex-wrap gap-2">
        <button
          className={`rounded-md border px-3 py-2 text-xs font-bold ${role === "CUSTOMER" ? "border-[#8c6d53] bg-[#f5f2eb] text-[#6f523e]" : "border-[#e7dfd5] bg-white text-[#7d7068]"}`}
          disabled={locked || role === "CUSTOMER"}
          onClick={() => void update({ role: "CUSTOMER" })}
        >
          Khách hàng
        </button>
        <button
          className={`rounded-md border px-3 py-2 text-xs font-bold ${role === "ADMIN" ? "border-[#8c6d53] bg-[#8c6d53] text-white" : "border-[#e7dfd5] bg-white text-[#7d7068]"}`}
          disabled={locked || role === "ADMIN"}
          onClick={() => void update({ role: "ADMIN" })}
        >
          Quản trị viên
        </button>
      </div>
    );
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className={`rounded-md border px-3 py-2 text-xs font-bold ${status === "ACTIVE" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#e7dfd5] bg-white text-[#7d7068]"}`}
        disabled={locked || status === "ACTIVE"}
        onClick={() => void update({ status: "ACTIVE" })}
      >
        Hoạt động
      </button>
      <button
        className={`rounded-md border px-3 py-2 text-xs font-bold ${status === "BLOCKED" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-[#e7dfd5] bg-white text-[#7d7068]"}`}
        disabled={locked || status === "BLOCKED"}
        onClick={() => void update({ status: "BLOCKED" })}
      >
        Khóa
      </button>
    </div>
  );
}
