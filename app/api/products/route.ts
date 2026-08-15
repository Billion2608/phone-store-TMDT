import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const now = new Date().toISOString();

    // 1. Tạo danh mục mẫu
    await client.query(`
      INSERT INTO "categories" ("name", "slug", "status", "created_at", "updated_at")
      VALUES 
        ('Điện thoại flagship', 'dien-thoai-flagship', true, '${now}', '${now}'),
        ('Điện thoại tầm trung', 'dien-thoai-tam-trung', true, '${now}', '${now}'),
        ('Điện thoại giá rẻ', 'dien-thoai-gia-re', true, '${now}', '${now}')
      ON CONFLICT DO NOTHING;
    `);

    // 2. Tạo thương hiệu mẫu
    await client.query(`
      INSERT INTO "brands" ("name", "slug", "status", "created_at", "updated_at")
      VALUES 
        ('Apple', 'apple', true, '${now}', '${now}'),
        ('Samsung', 'samsung', true, '${now}', '${now}'),
        ('Xiaomi', 'xiaomi', true, '${now}', '${now}'),
        ('OPPO', 'oppo', true, '${now}', '${now}')
      ON CONFLICT DO NOTHING;
    `);

    const catRes = await client.query('SELECT "id", "name" FROM "categories";');
    const brandRes = await client.query('SELECT "id", "name" FROM "brands";');

    const cats = catRes.rows;
    const brands = brandRes.rows;

    const getCatId = (keyword: string) => cats.find((c: any) => c.name.toLowerCase().includes(keyword.toLowerCase()))?.id || cats[0]?.id;
    const getBrandId = (name: string) => brands.find((b: any) => b.name.toLowerCase() === name.toLowerCase())?.id || brands[0]?.id;

    const catFlagship = getCatId('flagship');
    const catTamTrung = getCatId('tầm trung');
    const catGiaRe = getCatId('giá rẻ');

    const brandApple = getBrandId('Apple');
    const brandSamsung = getBrandId('Samsung');
    const brandXiaomi = getBrandId('Xiaomi');
    const brandOppo = getBrandId('OPPO');

    const products = [
      { name: "iPhone 15 Pro Max 256GB", cat: catFlagship, brand: brandApple, price: 29990000, desc: "Chip A17 Pro, khung Titan siêu nhẹ, camera zoom 5x." },
      { name: "iPhone 15 Pro 128GB", cat: catFlagship, brand: brandApple, price: 24990000, desc: "Hiệu năng đỉnh cao, thiết kế viền mỏng ấn tượng." },
      { name: "iPhone 15 Plus 128GB", cat: catFlagship, brand: brandApple, price: 22990000, desc: "Màn hình lớn 6.7 inch, thời lượng pin vượt trội." },
      { name: "iPhone 15 128GB", cat: catFlagship, brand: brandApple, price: 19990000, desc: "Dynamic Island hiện đại, camera 48MP sắc nét." },
      { name: "iPhone 14 Pro Max 128GB", cat: catFlagship, brand: brandApple, price: 26990000, desc: "Màn hình Always-On, Dynamic Island độc đáo." },
      { name: "iPhone 14 128GB", cat: catTamTrung, brand: brandApple, price: 16990000, desc: "Thiết kế bền bỉ, camera cải tiến chụp đêm xuất sắc." },
      { name: "iPhone 13 128GB", cat: catTamTrung, brand: brandApple, price: 13990000, desc: "Chip A15 Bionic mạnh mẽ, pin trâu giá tốt." },
      { name: "iPhone 12 64GB", cat: catTamTrung, brand: brandApple, price: 11990000, desc: "Màn hình OLED Super Retina XDR, thiết kế vuông vức." },
      { name: "iPhone 11 64GB", cat: catGiaRe, brand: brandApple, price: 8990000, desc: "Lựa chọn quốc dân, hiệu năng ổn định giá dễ cận." },

      { name: "Samsung Galaxy S24 Ultra 256GB", cat: catFlagship, brand: brandSamsung, price: 28990000, desc: "Quyền năng Galaxy AI, bút S-Pen tích hợp, khung Titan." },
      { name: "Samsung Galaxy S24 Plus 256GB", cat: catFlagship, brand: brandSamsung, price: 21990000, desc: "Màn hình 2K+ sắc nét, tích hợp trí tuệ nhân tạo AI." },
      { name: "Samsung Galaxy S24 128GB", cat: catFlagship, brand: brandSamsung, price: 16990000, desc: "Thiết kế nhỏ gọn, cấu hình Snapdragon 8 Gen 3." },
      { name: "Samsung Galaxy Z Fold5 256GB", cat: catFlagship, brand: brandSamsung, price: 32990000, desc: "Màn hình gập mở rộng lớn, đa nhiệm đỉnh cao." },
      { name: "Samsung Galaxy Z Flip5 256GB", cat: catFlagship, brand: brandSamsung, price: 18990000, desc: "Màn hình phụ Flex Window độc đáo, gập thời trang." },
      { name: "Samsung Galaxy A55 5G 128GB", cat: catTamTrung, brand: brandSamsung, price: 9990000, desc: "Thiết kế viền kim loại, chống nước IP67." },
      { name: "Samsung Galaxy A35 5G 128GB", cat: catTamTrung, brand: brandSamsung, price: 7990000, desc: "Màn hình Super AMOLED 120Hz mượt mà." },
      { name: "Samsung Galaxy A15 128GB", cat: catGiaRe, brand: brandSamsung, price: 4490000, desc: "Pin 5000mAh sử dụng cả ngày, màn hình sắc nét." },
      { name: "Samsung Galaxy A05s 128GB", cat: catGiaRe, brand: brandSamsung, price: 3290000, desc: "Giá rẻ cấu hình ổn định, màn hình lớn 6.7 inch." },

      { name: "Xiaomi 14 Ultra 512GB", cat: catFlagship, brand: brandXiaomi, price: 29990000, desc: "Ống kính Leica chuyên nghiệp, chip Snapdragon 8 Gen 3." },
      { name: "Xiaomi 14 256GB", cat: catFlagship, brand: brandXiaomi, price: 18990000, desc: "Compact flagship hoàn hảo, camera Leica sắc nét." },
      { name: "Xiaomi Redmi Note 13 Pro+ 5G", cat: catTamTrung, brand: brandXiaomi, price: 9490000, desc: "Camera 200MP, sạc nhanh 120W siêu tốc." },
      { name: "Xiaomi Redmi Note 13 Pro 4G", cat: catTamTrung, brand: brandXiaomi, price: 6790000, desc: "Màn hình AMOLED 120Hz, viền mỏng ấn tượng." },
      { name: "Xiaomi Redmi Note 13 128GB", cat: catTamTrung, brand: brandXiaomi, price: 4490000, desc: "Sạc nhanh 33W, camera 108MP trong tầm giá." },
      { name: "Xiaomi Poco X6 Pro 5G", cat: catTamTrung, brand: brandXiaomi, price: 8490000, desc: "Hiệu năng gaming cực khủng với chip Dimensity 8300-Ultra." },
      { name: "Xiaomi Redmi 13C 128GB", cat: catGiaRe, brand: brandXiaomi, price: 2990000, desc: "Thiết kế trẻ trung, dung lượng pin lớn giá hợp lý." },

      { name: "OPPO Find N3 512GB", cat: catFlagship, brand: brandOppo, price: 41990000, desc: "Flagship gập đỉnh cao, hệ thống camera Hasselblad." },
      { name: "OPPO Reno11 Pro 5G", cat: catFlagship, brand: brandOppo, price: 15990000, desc: "Chuyên gia chân dung, thiết kế mặt lưng ánh ngọc." },
      { name: "OPPO Reno11 5G", cat: catTamTrung, brand: brandOppo, price: 10490000, desc: "Màn hình cong 3D cao cấp, sạc SUPERVOOC 67W." },
      { name: "OPPO A98 5G", cat: catTamTrung, brand: brandOppo, price: 6990000, desc: "Sạc nhanh 67W, màn hình 120Hz mượt mà." },
      { name: "OPPO A58 128GB", cat: catGiaRe, brand: brandOppo, price: 4490000, desc: "Loa kép âm thanh lớn, thiết kế mỏng nhẹ sang trọng." },
      { name: "OPPO A18 128GB", cat: catGiaRe, brand: brandOppo, price: 3290000, desc: "Kháng nước chống bụi, pin 5000mAh siêu bền." }
    ];

    for (const p of products) {
      const slug = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(Math.random() * 1000);
      
      // Chèn Sản phẩm
      const prodRes = await client.query(`
        INSERT INTO "products" ("name", "slug", "category_id", "brand_id", "short_description", "description", "status", "created_at", "updated_at")
        VALUES (
          '${p.name.replace(/'/g, "''")}',
          '${slug}',
          ${p.cat},
          ${p.brand},
          '${p.desc.replace(/'/g, "''")}',
          'Chi tiết về ${p.name.replace(/'/g, "''")}: ${p.desc.replace(/'/g, "''")}',
          'ACTIVE'::text::products_status,
          '${now}',
          '${now}'
        ) RETURNING id;
      `);

      const productId = prodRes.rows[0].id;

      // Chèn Biến thể + Giá bán (Giúp trang chủ hiển thị đúng sản phẩm)
      await client.query(`
        INSERT INTO "product_variants" ("product_id", "sku", "price", "stock_quantity", "created_at", "updated_at")
        VALUES (
          '${productId}',
          'SKU-${Math.floor(Math.random() * 900000 + 100000)}',
          ${p.price},
          50,
          '${now}',
          '${now}'
        ) ON CONFLICT DO NOTHING;
      `);
    }

    return NextResponse.json({
      message: "Đã nạp thành công 30 sản phẩm kèm giá bán!",
      total: products.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}

export async function POST(request: Request) {
  return NextResponse.json({ message: "OK" });
}
