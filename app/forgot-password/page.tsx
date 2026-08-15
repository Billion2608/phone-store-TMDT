import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function ForgotPasswordPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <div className="flex flex-1 items-center justify-center bg-[linear-gradient(135deg,#fdfbf7,#f5f2eb)] px-4 py-12">
      <ForgotPasswordForm />
    </div>
  );
}
