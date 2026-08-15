import { Client } from "pg";
import Link from "next/link";

async function getCategoriesAndBrands() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    
    // Lấy danh mục & thương hiệu
    let categoriesRes = await client.query('SELECT "id", "name" FROM "categories" ORDER BY "name" ASC;');
    let brandsRes = await client.query('SELECT "id", "name" FROM "brands" ORDER BY "name" ASC;');

    let categories = categoriesRes.rows || [];
    let brands = brandsRes.rows || [];

    // Nếu chưa có danh mục/thương hiệu nào, tự động nạp mẫu để không bị trống
    const now = new Date().toISOString();
    if (categories.length === 0) {
      const insertedCat = await client.query(`
        INSERT INTO "categories" ("id", "name", "slug", "description", "status", "created_at", "updated_at")
        VALUES (gen_random_uuid()::text, 'Điện thoại', 'dien-thoai', 'Danh mục điện thoại', true, '${now}', '${now}')
        RETURNING "id", "name";
      `);
      categories = insertedCat.rows;
    }

    if (brands.length === 0) {
      const insertedBrand = await client.query(`
        INSERT INTO "brands" ("id", "name", "slug", "description", "status", "created_at", "updated_at")
        VALUES (gen_random_uuid()::text, 'Apple', 'apple', 'Thương hiệu Apple', true, '${now}', '${now}')
        RETURNING "id", "name";
      `);
      brands = insertedBrand.rows;
    }

    return { categories, brands };
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
          <label className="block text-sm font-medium text-stone-700 mb-1">Tên sản phẩm *</label>
          <input required type="text" name="name" className="w-full px-3 py-2 border border-stone-300 rounded-md" placeholder="Ví dụ: iPhone 15 Pro Max" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Danh mục *</label>
            <select required name="categoryId" className="w-full px-3 py-2 border border-stone-300 rounded-md">
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Thương hiệu *</label>
            <select required name="brandId" className="w-full px-3 py-2 border border-stone-300 rounded-md">
              {brands.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả ngắn</label>
          <input type="text" name="shortDescription" className="w-full px-3 py-2 border border-stone-300 rounded-md" placeholder="Tóm tắt đặc điểm..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Mô tả chi tiết</label>
          <textarea name="description" rows={4} className="w-full px-3 py-2 border border-stone-300 rounded-md" placeholder="Mô tả chi tiết sản phẩm..."></textarea>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="px-6 py-2 bg-stone-800 text-white rounded-md hover:bg-stone-700 font-medium">
            Lưu sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
}
