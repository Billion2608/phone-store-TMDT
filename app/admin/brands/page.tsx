import { BrandManager } from "@/components/admin/BrandManager";
import { getAdminBrands } from "@/services/admin.service";
export default async function BrandsPage() {
  const brands = await getAdminBrands();
  return (
    <div>
      <h1 className="admin-page-title">Thương hiệu</h1>
      <p className="admin-page-subtitle">Quản lý thương hiệu và logo.</p>
      <div className="mt-6">
        <BrandManager brands={brands} />
      </div>
    </div>
  );
}
