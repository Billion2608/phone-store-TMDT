import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  getAdminProduct,
  getProductFormOptions,
} from "@/services/admin.service";
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const [product, options] = await Promise.all([
    getAdminProduct(id),
    getProductFormOptions(),
  ]);
  if (!product) notFound();
  return (
    <div>
      <h1 className="admin-page-title">Chỉnh sửa sản phẩm</h1>
      <p className="admin-page-subtitle">
        Cập nhật thông tin, variants và specifications.
      </p>
      <div className="mt-6">
        <ProductForm id={id} initial={product} options={options} />
      </div>
    </div>
  );
}
