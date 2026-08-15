import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardData } from "@/types/product";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  if (!products.length) return <EmptyState title="Không tìm thấy sản phẩm" />;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
