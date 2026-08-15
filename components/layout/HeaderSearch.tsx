"use client";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CategoryDropdown } from "@/components/layout/CategoryDropdown";
import { ProductImage } from "@/components/product/ProductImage";
import { formatCurrency } from "@/utils/formatCurrency";
type Suggestion = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  salePrice: number | null;
};
export function HeaderSearch({
  categories,
}: {
  categories: Array<{ name: string; slug: string }>;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(query.trim())}&limit=6`,
          { signal: controller.signal },
        );
        const result = await response.json();
        if (response.ok) {
          setItems(result.data.items);
          setOpen(true);
        }
      } catch {}
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <form
      ref={root}
      action="/products"
      className="relative order-3 flex h-11 w-full basis-full overflow-visible rounded-md bg-white shadow-sm lg:order-none lg:ml-4 lg:max-w-[650px] lg:basis-auto"
      role="search"
    >
      <CategoryDropdown categories={categories} />
      <input
        aria-label="Tìm kiếm sản phẩm"
        autoComplete="off"
        className="min-w-0 flex-1 rounded-l-md px-3 text-sm text-[#2c221e] outline-none placeholder:text-[#9a8c83] md:rounded-l-none"
        name="search"
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => items.length > 0 && setOpen(true)}
        placeholder="Tìm điện thoại, phụ kiện, thương hiệu..."
        value={query}
      />
      <button
        className="grid w-12 place-items-center rounded-r-md bg-[#d97706] text-white transition-colors hover:bg-[#b86105]"
        type="submit"
        aria-label="Tìm kiếm"
      >
        <Search size={19} />
      </button>
      {open && query.trim().length >= 2 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-lg border border-[#e7dfd5] bg-white text-[#2c221e] shadow-xl">
          <div className="border-b border-[#eee8e1] px-4 py-2 text-xs font-bold text-[#8c6d53]">
            Sản phẩm gợi ý
          </div>
          {items.length ? (
            <div>
              {items.map((product) => (
                <Link
                  className="flex items-center gap-3 border-b border-[#f1ece6] p-3 last:border-0 hover:bg-[#fdfbf7]"
                  href={`/products/${product.slug}`}
                  key={product.id}
                  onClick={() => setOpen(false)}
                >
                  <ProductImage
                    alt={product.name}
                    className="size-14 shrink-0 rounded"
                    src={product.thumbnail}
                  />
                  <span className="min-w-0">
                    <strong className="line-clamp-1 text-sm">
                      {product.name}
                    </strong>
                    <span className="mt-1 block text-sm font-bold text-[#d97706]">
                      {formatCurrency(product.salePrice ?? product.price)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-4 text-sm text-[#7d7068]">
              Không tìm thấy sản phẩm phù hợp.
            </p>
          )}
          <Link
            className="block border-t border-[#eee8e1] px-4 py-2.5 text-center text-sm font-bold text-[#8c6d53] hover:bg-[#f5f2eb]"
            href={`/products?search=${encodeURIComponent(query)}`}
          >
            Xem tất cả kết quả
          </Link>
        </div>
      ) : null}
    </form>
  );
}
