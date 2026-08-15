import type { ReactNode } from "react";
import { BestSellerList } from "@/components/home/BestSellerList";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { ProductCardData } from "@/types/product";
export function ProductSection({
  title,
  products,
  href,
  tabs,
  icon,
  bestSellerTitle,
  featured = false,
}: {
  title: string;
  products: ProductCardData[];
  href: string;
  tabs?: Array<{ label: string; href: string }>;
  icon?: ReactNode;
  bestSellerTitle?: string;
  featured?: boolean;
}) {
  if (!products.length) return null;
  const main = bestSellerTitle ? products.slice(0, 8) : products;
  return (
    <section className="retail-section">
      <div
        className={`overflow-hidden rounded-lg border shadow-sm ${featured ? "border-[#8c6d53] bg-[#8c6d53] p-3 sm:p-4" : "border-[#e7dfd5] bg-white p-3 sm:p-4"}`}
      >
        <div
          className={
            featured
              ? "[&_*]:border-white/25 [&_a]:text-white [&_h2]:text-white [&_span]:text-white"
              : ""
          }
        >
          <SectionHeader href={href} icon={icon} tabs={tabs} title={title} />
        </div>
        <div className="flex gap-3">
          <div className="min-w-0 flex-1">
            <ProductGrid products={main} />
          </div>
          {bestSellerTitle ? (
            <BestSellerList products={products} title={bestSellerTitle} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
