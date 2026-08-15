import { ChevronRight, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductSpecifications } from "@/components/product/ProductSpecifications";
import { ProductVariants } from "@/components/product/ProductVariants";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/services/product.service";
export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return product
    ? {
        title: product.name,
        description:
          product.shortDescription ??
          `Mua ${product.name} chính hãng tại PhoneStore.`,
      }
    : { title: "Không tìm thấy sản phẩm" };
}
export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product.id, product.category, 5);
  return (
    <div className="bg-[#f5f5f5] pb-10">
      <div className="mx-auto max-w-[1280px] px-3 py-4 sm:px-4">
        <nav className="flex items-center gap-1 overflow-hidden text-xs text-gray-500">
          <Link className="hover:text-blue-600" href="/">
            Trang chủ
          </Link>
          <ChevronRight size={13} />
          <Link className="hover:text-blue-600" href="/products">
            Sản phẩm
          </Link>
          <ChevronRight size={13} />
          <span className="truncate text-gray-700">{product.name}</span>
        </nav>
        <section className="mt-3 grid border border-gray-200 bg-white lg:grid-cols-[45%_55%]">
          <div className="border-b border-gray-200 p-4 lg:border-b-0 lg:border-r">
            <ProductGallery
              images={product.images}
              productName={product.name}
            />
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-xs font-bold uppercase text-blue-600">
              {product.brand ?? product.category}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-900 sm:text-[28px]">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-gray-100 pb-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Star className="fill-amber-400 text-amber-400" size={15} />
                <strong className="text-gray-800">
                  {product.rating || "Mới"}
                </strong>
              </span>
              <span>{product.reviewCount} đánh giá</span>
              <span>Đã bán {product.soldCount}</span>
            </div>
            {product.shortDescription ? (
              <p className="mt-4 border-l-3 border-blue-500 pl-3 text-sm leading-6 text-gray-600">
                {product.shortDescription}
              </p>
            ) : null}
            <ProductVariants variants={product.variants} />
          </div>
        </section>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="border border-gray-200 bg-white p-4 sm:p-5">
            <h2 className="border-b border-gray-200 pb-3 text-lg font-bold text-gray-900">
              Mô tả sản phẩm
            </h2>
            <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">
              {product.description ||
                product.shortDescription ||
                "Nội dung mô tả đang được cập nhật."}
            </div>
          </section>
          <ProductSpecifications specifications={product.specifications} />
        </div>
        <div className="mt-4">
          <ProductReviews rating={product.rating} reviews={product.reviews} />
        </div>
        {related.length ? (
          <section className="mt-7">
            <h2 className="mb-4 border-b border-gray-200 pb-2 text-xl font-bold text-gray-900">
              Sản phẩm liên quan
            </h2>
            <ProductGrid products={related} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
