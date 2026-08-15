import { CategoryManager } from "@/components/admin/CategoryManager";
import { getAdminCategories } from "@/services/admin.service";
export default async function CategoriesPage() {
  const categories = await getAdminCategories();
  return (
    <div>
      <h1 className="admin-page-title">Danh mục</h1>
      <p className="admin-page-subtitle">
        Quản lý cấu trúc danh mục cha và con.
      </p>
      <div className="mt-6">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
