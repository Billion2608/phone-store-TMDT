import { NextResponse } from "next/server";
import { Client } from "pg";

// 1. TỰ ĐỘNG NẠP 30 SẢN PHẨM KHI TRUY CẬP /api/products
export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const now = new Date().toISOString();

    // Tạo danh mục mẫu (chỉ dùng các cột chuẩn: id, name, slug, status, created_at, updated_at)
    await client.query(`
      INSERT INTO "categories" ("id", "name", "slug", "status", "created_at", "updated_at")
      VALUES 
        ('cat-1', 'Điện thoại flagship', 'dien-thoai-flagship', true, '${now}', '${now}'),
        ('cat-2', 'Điện thoại tầm trung', 'dien-thoai-tam-trung', true, '${now}', '${now}'),
        ('cat-3', 'Điện thoại giá rẻ', 'dien-thoai-gia-re', true, '${now}', '${now}')
      ON CONFLICT ("id") DO NOTHING;
    `);

    // Tạo thương hiệu mẫu
    await client.query(`
      INSERT INTO "brands" ("id", "name", "slug", "status", "created_at", "updated_at")
      VALUES 
        ('brand-apple', 'Apple', 'apple', true, '${now}', '${now}'),
        ('brand-samsung', 'Samsung', 'samsung', true, '${now}', '${now}'),
        ('brand-xiaomi', 'Xiaomi', 'xiaomi', true, '${now}', '${now}'),
        ('brand-oppo', 'OPPO', 'oppo', true, '${now}', '${now}')
      ON CONFLICT ("id") DO NOTHING;
    `);

    // Danh sách 30 sản phẩm
    const products = [
      { name: "iPhone 15 Pro Max 256GB", cat: "cat-1", brand: "brand-apple", desc: "Chip A17 Pro, khung Titan siêu nhẹ, camera zoom 5x." },
      { name: "iPhone 15 Pro 128GB", cat: "cat-1", brand: "brand-apple", desc: "Hiệu năng đỉnh cao, thiết kế viền mỏng ấn tượng." },
      { name: "iPhone 15 Plus 128GB", cat: "cat-1", brand: "brand-apple", desc: "Màn hình lớn 6.7 inch, thời lượng pin vượt trội." },
      { name: "iPhone 15 128GB", cat: "cat-1", brand: "brand-apple", desc: "Dynamic Island hiện đại, camera 48MP sắc nét." },
      { name: "iPhone 14 Pro Max 128GB", cat: "cat-1", brand: "brand-apple", desc: "Màn hình Always-On, Dynamic Island độc đáo." },
      { name: "iPhone 14 128GB", cat: "cat-2", brand: "brand-apple", desc: "Thiết kế bền bỉ, camera cải tiến chụp đêm xuất sắc." },
      { name: "iPhone 13 128GB", cat: "cat-2", brand: "brand-apple", desc: "Chip A15 Bionic mạnh mẽ, pin trâu giá tốt." },
      { name: "iPhone 12 64GB", cat: "cat-2", brand: "brand-apple", desc: "Màn hình OLED Super Retina XDR, thiết kế vuông vức." },
      { name: "iPhone 11 64GB", cat: "cat-3", brand: "brand-apple", desc: "Lựa chọn quốc dân, hiệu năng ổn định giá dễ cận." },

      { name: "Samsung Galaxy S24 Ultra 256GB", cat: "cat-1", brand: "brand-samsung", desc: "Quyền năng Galaxy AI, bút S-Pen tích hợp, khung Titan." },
      { name: "Samsung Galaxy S24 Plus 256GB", cat: "cat-1", brand: "brand-samsung", desc: "Màn hình 2K+ sắc nét, tích hợp trí tuệ nhân tạo AI." },
      { name: "Samsung Galaxy S24 128GB", cat: "cat-1", brand: "brand-samsung", desc: "Thiết kế nhỏ gọn, cấu hình Snapdragon 8 Gen 3." },
      { name: "Samsung Galaxy Z Fold5 256GB", cat: "cat-1", brand: "brand-samsung", desc: "Màn hình gập mở rộng lớn, đa nhiệm đỉnh cao." },
      { name: "Samsung Galaxy Z Flip5 256GB", cat: "cat-1", brand: "brand-samsung", desc: "Màn hình phụ Flex Window độc đáo, gập thời trang." },
      { name: "Samsung Galaxy A55 5G 128GB", cat: "cat-2", brand: "brand-samsung", desc: "Thiết kế viền kim loại, chống nước IP67." },
      { name: "Samsung Galaxy A35 5G 128GB", cat: "cat-2", brand: "brand-samsung", desc: "Màn hình Super AMOLED 120Hz mượt mà." },
      { name: "Samsung Galaxy A15 128GB", cat: "cat-3", brand: "brand-samsung", desc: "Pin 5000mAh sử dụng cả ngày, màn hình sắc nét." },
      { name: "Samsung Galaxy A05s 128GB", cat: "cat-3", brand: "brand-samsung", desc: "Giá rẻ cấu hình ổn định, màn hình lớn 6.7 inch." },

      { name: "Xiaomi 14 Ultra 512GB", cat: "cat-1", brand: "brand-xiaomi", desc: "Ống kính Leica chuyên nghiệp, chip Snapdragon 8 Gen 3." },
      { name: "Xiaomi 14 256GB", cat: "cat-1", brand: "brand-xiaomi", desc: "Compact flagship hoàn hảo, camera Leica sắc nét." },
      { name: "Xiaomi Redmi Note 13 Pro+ 5G", cat: "cat-2", brand: "brand-xiaomi", desc: "Camera 200MP, sạc nhanh 120W siêu tốc." },
      { name: "Xiaomi Redmi Note 13 Pro 4G", cat: "cat-2", brand: "brand-xiaomi", desc: "Màn hình AMOLED 120Hz, viền mỏng ấn tượng." },
      { name: "Xiaomi Redmi Note 13 128GB", cat: "cat-2", brand: "brand-xiaomi", desc: "Sạc nhanh 33W, camera 108MP trong tầm giá." },
      { name: "Xiaomi Poco X6 Pro 5G", cat: "cat-2", brand: "brand-xiaomi", desc: "Hiệu năng gaming cực khủng với chip Dimensity 8300-Ultra." },
      { name: "Xiaomi Redmi 13C 128GB", cat: "cat-3", brand: "brand-xiaomi", desc: "Thiết kế trẻ trung, dung lượng pin lớn giá hợp lý." },

      { name: "OPPO Find N3 512GB", cat: "cat-1", brand: "brand-oppo", desc: "Flagship gập đỉnh cao, hệ thống camera Hasselblad." },
      { name: "OPPO Reno11 Pro 5G", cat: "cat-1", brand: "brand-oppo", desc: "Chuyên gia chân dung, thiết kế mặt lưng ánh ngọc." },
      { name: "OPPO Reno11 5G", cat: "cat-2", brand: "brand-oppo", desc: "Màn hình cong 3D cao cấp, sạc SUPERVOOC 67W." },
      { name: "OPPO A98 5G", cat: "cat-2", brand: "brand-oppo", desc: "Sạc nhanh 67W, màn hình 120Hz mượt mà." },
      { name: "OPPO A58 128GB", cat: "cat-3", brand: "brand-oppo", desc: "Loa kép âm thanh lớn, thiết kế mỏng nhẹ sang trọng." },
      { name: "OPPO A18 128GB", cat: "cat-3", brand: "brand-oppo", desc: "Kháng nước chống bụi, pin 5000mAh siêu bền." }
    ];

    for (const p of products) {
      const slug = p.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(Math.random() * 1000);
      
      await client.query(`
        INSERT INTO "products" ("id", "name", "slug", "category_id", "brand_id", "short_description", "description", "status", "created_at", "updated_at")
        VALUES (
          gen_random_uuid()::text,
          '${p.name.replace(/'/g, "''")}',
          '${slug}',
          '${p.cat}',
          '${p.brand}',
          '${p.desc.replace(/'/g, "''")}',
          'Chi tiết về ${p.name.replace(/'/g, "''")}: ${p.desc.replace(/'/g, "''")}',
          'ACTIVE'::text::products_status,
          '${now}',
          '${now}'
        );
      `);
    }

    return NextResponse.json({
      message: "Đã nạp thành công 30 sản phẩm vào hệ thống!",
      total: products.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}

// 2. XỬ LÝ FORM THÊM SẢN PHẨM MỚI
export async function POST(request: Request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    let name = "", categoryId = "", brandId = "", shortDescription = "", description = "";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = formData.get("name")?.toString() || "";
      categoryId = formData.get("categoryId")?.toString() || "";
      brandId = formData.get("brandId")?.toString() || "";
      shortDescription = formData.get("shortDescription")?.toString() || "";
      description = formData.get("description")?.toString() || "";
    } else {
      const body = await request.json();
      name = body.name || "";
      categoryId = body.categoryId || "";
      brandId = body.brandId || "";
      shortDescription = body.shortDescription || "";
      description = body.description || "";
    }

    if (!name || !categoryId || !brandId) {
      return NextResponse.json({ error: "Thiếu thông tin sản phẩm" }, { status: 400 });
    }

    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-") + "-" + Date.now();
    const now = new Date().toISOString();

    await client.query(`
      INSERT INTO "products" ("id", "name", "slug", "category_id", "brand_id", "short_description", "description", "status", "created_at", "updated_at")
      VALUES (
        gen_random_uuid()::text,
        '${name.replace(/'/g, "''")}',
        '${slug}',
        '${categoryId}',
        '${brandId}',
        '${shortDescription.replace(/'/g, "''")}',
        '${description.replace(/'/g, "''")}',
        'ACTIVE'::text::products_status,
        '${now}',
        '${now}'
      );
    `);

    return NextResponse.redirect(new URL("/admin/products", request.url), 303);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
