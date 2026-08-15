import { Client } from "pg";
import Link from "next/link";

async function getCategoriesAndBrands() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const categoriesRes = await client.query('SELECT "id", "name" FROM "categories" WHERE "status" = true ORDER BY "name" ASC;');
    const brandsRes = await client.query('SELECT "id", "name" FROM "brands" WHERE "status" = true ORDER BY "name" ASC;');

    return {
      categories: categoriesRes.rows || [],
      brands: brandsRes.rows || [],
    };
  } catch (error) {
    console.error("Lỗi lấy danh mục/thương hiệu:", error);
    return { categories: [], brands: [] };
  } finally {
    await client.end();
  }
}

export default async function CreateProductPage() {
  const { categories, brands } = await getCategoriesAndBrands();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Thêm sản phẩm mới</h1>
        <Link href="/admin/products" className="px-4 py-2 bg-stone-200 text-stone-700 rounded-md hover:bg-stone-300">
          Trở về
        </Link>
      </div>

      <form action="/api/products" method="POST" className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-stone-200">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Tên sản phẩm</label>
          <input required type="text" name="name" className="w-full px-3 py-2 border border-stone-300 rounded-md" placeholder="Nhập tên sản phẩm..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Danh mục</label>
            <select required name="categoryId" className="w-full px-3 py-2 border border-stone-300 rounded-md">
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Thương hiệu</label>
            <select required name="brandId" className="w-full px-3 py-2 border border-stone-300 rounded-md">
              <option value="">-- Chọn thương hiệu --</option>
              {brands.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả ngắn</label>
          <input type="text" name="shortDescription" className="w-full px-3 py-2 border border-stone-300 rounded-md" placeholder="Tóm tắt đặc điểm nổi bật..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả chi tiết</label>
          <textarea name="description" rows={4} className="w-full px-3 py-2 border border-stone-300 rounded-md" placeholder="Mô tả chi tiết sản phẩm..."></textarea>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="px-6 py-2 bg-stone-800 text-white rounded-md hover:bg-stone-700">
            Lưu sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
}
