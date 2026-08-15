import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminFrame } from "@/components/layout/AdminFrame";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");
  return <AdminFrame name={user.fullName}>{children}</AdminFrame>;
}
