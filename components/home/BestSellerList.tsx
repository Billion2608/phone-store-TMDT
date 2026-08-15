import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import type { ProductCardData } from "@/types/product";
import { formatCurrency } from "@/utils/formatCurrency";
export function BestSellerList({
  products,
  title,
}: {
  products: ProductCardData[];
  title: string;
}) {
  return (
    <aside className="hidden w-[270px] shrink-0 border border-gray-200 bg-white xl:block">
      <h3 className="border-b-2 border-red-600 bg-gray-50 px-3 py-2.5 text-sm font-bold uppercase">
        {title}
      </h3>
      <div>
        {products.slice(0, 5).map((product, index) => (
          <Link
            className="flex gap-2 border-b border-gray-100 p-2.5 last:border-0 hover:bg-red-50"
            href={`/products/${product.slug}`}
            key={product.id}
          >
            <span className="w-4 pt-4 text-center text-xs font-bold text-red-600">
              {index + 1}
            </span>
            <ProductImage
              alt={product.name}
              className="size-16 shrink-0"
              src={product.thumbnail}
            />
            <span className="min-w-0 pt-1">
              <strong className="line-clamp-2 text-xs leading-4 text-gray-800">
                {product.name}
              </strong>
              <span className="mt-1 block text-sm font-bold text-red-600">
                {formatCurrency(product.salePrice ?? product.price)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
