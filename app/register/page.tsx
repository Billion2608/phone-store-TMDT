import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <div className="flex flex-1 items-center justify-center bg-[linear-gradient(135deg,#fdfbf7,#f5f2eb)] px-4 py-12">
      <RegisterForm />
    </div>
  );
}
