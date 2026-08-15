import { Plus } from "lucide-react";
import Link from "next/link";
import { ApiActionButton } from "@/components/admin/ApiActionButton";
import { getAdminProducts } from "@/services/admin.service";
import { formatDate } from "@/utils/formatDate";
export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Sản phẩm</h1>
          <p className="admin-page-subtitle">
            Quản lý sản phẩm, phiên bản, tồn kho và thông số.
          </p>
        </div>
        <Link className="admin-primary-button" href="/admin/products/create">
          <Plus size={18} /> Thêm sản phẩm
        </Link>
      </div>
      <section className="admin-card mt-6">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Thương hiệu</th>
                <th>Variants</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <small className="block text-slate-400">
                      /{product.slug}
                    </small>
                  </td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>{product.variants}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span className="admin-badge">{product.status}</span>
                  </td>
                  <td>{formatDate(product.createdAt)}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700"
                        href={`/admin/products/${product.id}/edit`}
                      >
                        Sửa
                      </Link>
                      <ApiActionButton
                        className="bg-rose-50 text-rose-700"
                        confirmText="Ngừng bán sản phẩm này?"
                        label="Lưu trữ"
                        method="DELETE"
                        url={`/api/admin/products/${product.id}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
