import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/services/cart.service";
import { getDefaultAddress } from "@/services/order.service";
export const dynamic = "force-dynamic";
export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");
  const [cart, savedAddress] = await Promise.all([
    getCart(user.id),
    getDefaultAddress(user.id),
  ]);
  if (!cart.items.length) redirect("/cart");
  return (
    <div className="bg-[#fdfbf7] pb-12">
      <div className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4">
        <h1 className="text-2xl font-bold text-[#2c221e]">Thanh toán</h1>
        <p className="mt-1 text-sm text-[#7d7068]">
          Kiểm tra thông tin giao hàng và lựa chọn phương thức thanh toán.
        </p>
        <div className="mt-5">
          <CheckoutForm cart={cart} savedAddress={savedAddress} user={user} />
        </div>
      </div>
    </div>
  );
}
