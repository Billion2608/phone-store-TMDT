import { Heart } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/layout/AccountSidebar";
import { ProductCard } from "@/components/product/ProductCard";
import { getCurrentUser } from "@/lib/auth";
import { getWishlist } from "@/services/wishlist.service";
export const dynamic = "force-dynamic";
export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile/wishlist");
  const products = await getWishlist(user.id);
  return (
    <div className="bg-[#f5f5f5] pb-10">
      <div className="mx-auto grid max-w-[1280px] gap-4 px-3 py-6 sm:px-4 md:grid-cols-[230px_1fr]">
        <AccountSidebar active="wishlist" user={user} />
        <main className="min-w-0">
          <div className="mb-4 border-b border-gray-200 pb-3">
            <h1 className="text-xl font-bold">Sản phẩm yêu thích</h1>
            <p className="mt-1 text-sm text-gray-500">
              {products.length} sản phẩm đã lưu
            </p>
          </div>
          {products.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlistActive
                />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 bg-white p-10 text-center">
              <Heart className="mx-auto text-gray-300" size={40} />
              <h2 className="mt-3 text-lg font-bold">
                Chưa có sản phẩm yêu thích
              </h2>
              <Link
                className="mt-4 inline-flex rounded-sm bg-blue-600 px-4 py-2 font-bold text-white"
                href="/products"
              >
                Khám phá sản phẩm
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
