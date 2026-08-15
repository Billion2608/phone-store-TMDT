import { BannerManager } from "@/components/admin/BannerManager";
import { getAdminBanners } from "@/services/banner.service";
export const dynamic = "force-dynamic";
export default async function AdminBannersPage() {
  const banners = await getAdminBanners();
  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Quản lý banner</h1>
          <p className="admin-page-subtitle">
            Cập nhật slider quảng bá hiển thị trên trang chủ.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <BannerManager banners={banners} />
      </div>
    </div>
  );
}
