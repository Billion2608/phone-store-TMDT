"use client";

import { useState } from "react";
import { Star, ShoppingCart, Loader2 } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { WishlistButton } from "@/components/product/WishlistButton";
import type { ProductCardData } from "@/types/product";
import { formatCurrency } from "@/utils/formatCurrency";

export function ProductCard({
  product,
  wishlistActive = false,
}: {
  product: ProductCardData;
  wishlistActive?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const currentPrice = product.salePrice ?? product.price;
  const discount =
    product.salePrice && product.price > product.salePrice
      ? Math.round((1 - product.salePrice / product.price) * 100)
      : 0;

  // Hàm xử lý Thêm vào giỏ hàng
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Tránh chuyển hướng trang khi bấm nút "Thêm vào giỏ"
    
    if (product.stock <= 0) {
      alert("Sản phẩm này hiện đã hết hàng!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      const data = await res.json();

      if (res.status === 401) {
        alert("Vui lòng đăng nhập để thực hiện chức năng này!");
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        alert(data.message || "Không thể thêm vào giỏ hàng.");
        return;
      }

      alert("Thêm vào giỏ hàng thành công! 🎉");
    } catch (error) {
      console.error("Lỗi khi thêm giỏ hàng:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="product-card-stable group relative flex min-w-0 flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-[border-color,box-shadow] duration-150 hover:z-10 hover:border-slate-300 hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block">
        <ProductImage
          alt={product.name}
          className="aspect-square"
          src={product.thumbnail}
        />
        {discount > 0 ? (
          <span className="absolute left-0 top-2 rounded-r bg-[#e66a3c] px-2 py-1 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        ) : null}
        {product.stock <= 0 ? (
          <span className="absolute bottom-0 left-0 bg-gray-700 px-2 py-1 text-[11px] text-white">
            Hết hàng
          </span>
        ) : null}
      </Link>
      
      <span className="absolute right-2 top-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
        <WishlistButton initialActive={wishlistActive} productId={product.id} />
      </span>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[11px] font-semibold uppercase text-gray-400">
          {product.brand ?? product.category}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="mt-1 line-clamp-2 min-h-10 text-[13px] font-semibold leading-5 text-gray-800 hover:text-[var(--retail-red)] sm:text-sm"
        >
          {product.name}
        </Link>
        
        <div className="mt-2">
          <p className="text-base font-bold text-[#d6452d] sm:text-lg">
            {formatCurrency(currentPrice)}
          </p>
          {product.salePrice ? (
            <p className="text-xs text-gray-400 line-through">
              {formatCurrency(product.price)}
            </p>
          ) : (
            <span className="block h-4" />
          )}
        </div>

        <div className="mt-2 flex items-center justify-between gap-1 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="fill-amber-500 text-amber-500" size={13} />
            {product.rating || "Mới"}
            {product.reviewCount ? ` (${product.reviewCount})` : ""}
          </span>
          <span>Đã bán {product.soldCount}</span>
        </div>

        {/* Nút Thêm vào giỏ hàng */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={loading || product.stock <= 0}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-[#5c4738] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#4a392d] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={14} />
          ) : (
            <ShoppingCart size={14} />
          )}
          {product.stock <= 0 ? "Hết hàng" : loading ? "Đang thêm..." : "Thêm vào giỏ"}
        </button>
      </div>
    </article>
  );
}
