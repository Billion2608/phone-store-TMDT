import { Client } from "pg";

async function getBrands() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM "brands" ORDER BY "created_at" DESC;');
    return result.rows || [];
  } catch (error) {
    console.error("Lỗi lấy thương hiệu:", error);
    return [];
  } finally {
    await client.end();
  }
}

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Thương hiệu</h1>
          <p className="text-sm text-stone-500">Quản lý danh sách các thương hiệu điện thoại</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 text-stone-600 text-xs uppercase border-b border-stone-200">
              <th className="py-3 px-4">Tên thương hiệu</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 text-sm">
            {brands.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-stone-500">Chưa có thương hiệu nào</td>
              </tr>
            ) : (
              brands.map((item: any) => (
                <tr key={item.id} className="hover:bg-stone-50">
                  <td className="py-3 px-4 font-medium text-stone-800">{item.name}</td>
                  <td className="py-3 px-4 text-stone-500">{item.slug}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.status ? 'HOẠT ĐỘNG' : 'ẨN'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="px-3 py-1 text-xs bg-stone-200 text-stone-700 rounded hover:bg-stone-300">Sửa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
