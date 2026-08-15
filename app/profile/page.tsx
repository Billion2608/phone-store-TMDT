import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth/ProfileForm";
import { AccountSidebar } from "@/components/layout/AccountSidebar";
import { getCurrentUser } from "@/lib/auth";
import { getDefaultAddress } from "@/services/order.service";
export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");
  const savedAddress = await getDefaultAddress(user.id);
  const address = savedAddress ?? { province: "", district: "", ward: "", address: "" };
  return (
    <div className="bg-[#f5f2eb] pb-10">
      <div className="mx-auto grid max-w-[1100px] gap-5 px-3 py-6 sm:px-4 md:grid-cols-[230px_1fr]">
        <AccountSidebar active="profile" user={user} />
        <main className="rounded-lg border border-[#e7dfd5] bg-white p-5 shadow-sm sm:p-6">
          <h1 className="border-b border-[#eee8e1] pb-3 text-xl font-bold">
            Thông tin tài khoản
          </h1>
          <p className="mt-2 text-sm text-[#7d7068]">
            Cập nhật thông tin liên hệ dùng cho tài khoản và đơn hàng.
          </p>
          <ProfileForm address={address} user={user} />
        </main>
      </div>
    </div>
  );
}
