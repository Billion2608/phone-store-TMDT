import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const requested = (await searchParams).next;

  // 1. Kiểm tra chính xác đường dẫn chuyển hướng sau khi Login
  const nextPath =
    requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/admin";

  // 2. Nếu ĐÃ ĐĂNG NHẬP, chuyển hướng sang đúng trang họ muốn đến (hoặc /admin) chứ KHÔNG đẩy về "/"
  if (user) {
    // Nếu tài khoản là Admin thì đẩy thẳng về /admin
    if (user.role === "ADMIN") {
      redirect("/admin");
    }
    redirect(nextPath);
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-[linear-gradient(135deg,#fdfbf7,#f5f2eb)] px-4 py-8">
      <LoginForm nextPath={nextPath} />
    </div>
  );
}
