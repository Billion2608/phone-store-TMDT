import { CouponManager } from "@/components/admin/CouponManager";
import { getAdminCoupons } from "@/services/admin.service";
export default async function CouponsPage() {
  const coupons = await getAdminCoupons();
  return (
    <div>
      <h1 className="admin-page-title">Coupons</h1>
      <p className="admin-page-subtitle">
        Quản lý mã giảm giá và giới hạn sử dụng.
      </p>
      <div className="mt-6">
        <CouponManager coupons={coupons} />
      </div>
    </div>
  );
}
