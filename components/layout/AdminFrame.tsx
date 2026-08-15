"use client";
import type { ReactNode } from "react";
import { useState } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
export function AdminFrame({
  children,
  name,
}: {
  children: ReactNode;
  name: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className={`admin-shell min-h-screen bg-[#f5f2eb] transition-[padding] duration-200 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}
    >
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <AdminHeader name={name} />
      <main className="mx-auto w-full max-w-[1480px] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
