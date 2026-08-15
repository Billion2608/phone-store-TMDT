import { ProductForm } from "@/components/admin/ProductForm";
import { getProductFormOptions } from "@/services/admin.service";
export default async function CreateProductPage() {
  const options = await getProductFormOptions();
  return (
    <div>
      <h1 className="admin-page-title">Tạo sản phẩm</h1>
      <p className="admin-page-subtitle">
        Thêm sản phẩm cùng nhiều phiên bản và thông số.
      </p>
      <div className="mt-6">
        <ProductForm options={options} />
      </div>
    </div>
  );
}
