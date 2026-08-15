import { redirect } from "next/navigation";
import { CartClient } from "@/components/cart/CartClient";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/services/cart.service";
export const dynamic = "force-dynamic";
export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");
  const cart = await getCart(user.id);
  return (
    <div className="bg-[#fdfbf7] pb-12">
      <div className="mx-auto max-w-[1280px] px-3 py-6 sm:px-4">
        <h1 className="text-3xl font-bold text-[#2c221e]">Giỏ hàng</h1>
        <p className="mt-1 text-sm text-[#7d7068]">
          {cart.itemCount} sản phẩm trong giỏ hàng
        </p>
        <div className="mt-5">
          <CartClient initialCart={cart} />
        </div>
      </div>
    </div>
  );
}
