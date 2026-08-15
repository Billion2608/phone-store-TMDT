const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("🌱 Đang nạp dữ liệu Admin và 30 sản phẩm điện thoại...");

  try {
    // 1. Users (Admin: admin@gmail.com / admin@1234)
    await client.query(`
      INSERT INTO "users" ("id", "email", "password", "full_name", "phone", "role", "status")
      VALUES 
        (1, 'admin@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', '0900444333', 'ADMIN'::text::users_role, 'ACTIVE'::text::users_status),
        (2, 'user@phonestore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', '0999888777', 'USER'::text::users_role, 'ACTIVE'::text::users_status)
      ON CONFLICT ("id") DO UPDATE SET 
        "email" = EXCLUDED."email",
        "password" = EXCLUDED."password";
    `);

    // 2. Categories
    await client.query(`
      INSERT INTO "categories" ("id", "name", "slug", "image", "status")
      VALUES 
        (1, 'iPhone', 'iphone', '/uploads/categories/iphone.webp', true),
        (2, 'Samsung', 'samsung', '/uploads/categories/samsung.webp', true),
        (3, 'Xiaomi', 'xiaomi', '/uploads/categories/xiaomi.webp', true),
        (4, 'OPPO', 'oppo', '/uploads/categories/oppo.webp', true)
      ON CONFLICT ("id") DO NOTHING;
    `);

    // 3. Brands
    await client.query(`
      INSERT INTO "brands" ("id", "name", "slug", "logo", "status")
      VALUES 
        (1, 'Apple', 'apple', '/uploads/brands/apple.png', true),
        (2, 'Samsung', 'samsung', '/uploads/brands/samsung.png', true),
        (3, 'Xiaomi', 'xiaomi', '/uploads/brands/xiaomi.png', true),
        (4, 'OPPO', 'oppo', '/uploads/brands/oppo.png', true)
      ON CONFLICT ("id") DO NOTHING;
    `);

    // 4. Products (30 Điện thoại)
    const productsData = [
      // Apple
      [1, 1, 1, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'Chip A17 Pro, Khung Titanium', 'Mô tả chi tiết iPhone 15 Pro Max chính hãng'],
      [2, 1, 1, 'iPhone 15 Pro', 'iphone-15-pro', 'Thiết kế nhẹ hơn, Nút Action mới', 'Mô tả chi tiết iPhone 15 Pro chính hãng'],
      [3, 1, 1, 'iPhone 15 Plus', 'iphone-15-plus', 'Màn hình lớn 6.7 inch, Dynamic Island', 'Mô tả chi tiết iPhone 15 Plus chính hãng'],
      [4, 1, 1, 'iPhone 15', 'iphone-15', 'Camera 48MP, Dynamic Island', 'Mô tả chi tiết iPhone 15 chính hãng'],
      [5, 1, 1, 'iPhone 14 Pro Max', 'iphone-14-pro-max', 'Chip A16 Bionic, Màn hình Always-On', 'Mô tả chi tiết iPhone 14 Pro Max'],
      [6, 1, 1, 'iPhone 14 Pro', 'iphone-14-pro', 'Dynamic Island đỉnh cao', 'Mô tả chi tiết iPhone 14 Pro'],
      [7, 1, 1, 'iPhone 14', 'iphone-14', 'Thiết kế bền bỉ, Pin ấn tượng', 'Mô tả chi tiết iPhone 14'],
      [8, 1, 1, 'iPhone 13', 'iphone-13', 'Sức mạnh vượt trội với A15 Bionic', 'Mô tả chi tiết iPhone 13'],
      [9, 1, 1, 'iPhone 12', 'iphone-12', 'Màn hình OLED, Thiết kế góc cạnh', 'Mô tả chi tiết iPhone 12'],
      [10, 1, 1, 'iPhone 11', 'iphone-11', 'Lựa chọn quốc dân, hiệu năng ổn định', 'Mô tả chi tiết iPhone 11'],

      // Samsung
      [11, 2, 2, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Quyền năng Galaxy AI, Khung Titanium', 'Mô tả chi tiết Galaxy S24 Ultra'],
      [12, 2, 2, 'Samsung Galaxy S24 Plus', 'samsung-galaxy-s24-plus', 'Màn hình 2K, Tích hợp AI thông minh', 'Mô tả chi tiết Galaxy S24 Plus'],
      [13, 2, 2, 'Samsung Galaxy S24', 'samsung-galaxy-s24', 'Thiết kế gọn gàng, Hiệu năng mạnh mẽ', 'Mô tả chi tiết Galaxy S24'],
      [14, 2, 2, 'Samsung Galaxy Z Fold5', 'samsung-galaxy-z-fold5', 'Gập mở đa năng, Màn hình cực đại', 'Mô tả chi tiết Z Fold5'],
      [15, 2, 2, 'Samsung Galaxy Z Flip5', 'samsung-galaxy-z-flip5', 'Màn hình phụ Flex Window lớn', 'Mô tả chi tiết Z Flip5'],
      [16, 2, 2, 'Samsung Galaxy A55 5G', 'samsung-galaxy-a55-5g', 'Khung kim loại sang trọng, Camera AI', 'Mô tả chi tiết Galaxy A55'],
      [17, 2, 2, 'Samsung Galaxy A35 5G', 'samsung-galaxy-a35-5g', 'Màn hình Super AMOLED 120Hz', 'Mô tả chi tiết Galaxy A35'],
      [18, 2, 2, 'Samsung Galaxy A25 5G', 'samsung-galaxy-a25-5g', 'Camera OIS chống rung chuyên nghiệp', 'Mô tả chi tiết Galaxy A25'],
      [19, 2, 2, 'Samsung Galaxy A15 5G', 'samsung-galaxy-a15-5g', 'Pin 5000mAh, Sạc nhanh 25W', 'Mô tả chi tiết Galaxy A15'],
      [20, 2, 2, 'Samsung Galaxy S23 FE', 'samsung-galaxy-s23-fe', 'Cấu hình flagship giá tầm trung', 'Mô tả chi tiết Galaxy S23 FE'],

      // Xiaomi
      [21, 3, 3, 'Xiaomi 14 Ultra', 'xiaomi-14-ultra', 'Ống kính Leica cao cấp, Chip Snapdragon 8 Gen 3', 'Mô tả chi tiết Xiaomi 14 Ultra'],
      [22, 3, 3, 'Xiaomi 14', 'xiaomi-14', 'Kích thước nhỏ gọn, Hiệu năng đỉnh cao', 'Mô tả chi tiết Xiaomi 14'],
      [23, 3, 3, 'Xiaomi Redmi Note 13 Pro+ 5G', 'redmi-note-13-pro-plus', 'Camera 200MP, Sạc siêu tốc 120W', 'Mô tả chi tiết Redmi Note 13 Pro+'],
      [24, 3, 3, 'Xiaomi Redmi Note 13 Pro', 'redmi-note-13-pro', 'Màn hình AMOLED 1.5K sắc nét', 'Mô tả chi tiết Redmi Note 13 Pro'],
      [25, 3, 3, 'Xiaomi Redmi Note 13', 'redmi-note-13', 'Thiết kế vuông vức thời thượng', 'Mô tả chi tiết Redmi Note 13'],
      [26, 3, 3, 'Xiaomi Poco F6', 'poco-f6', 'Quái vật hiệu năng trong tầm giá', 'Mô tả chi tiết Poco F6'],

      // OPPO
      [27, 4, 4, 'OPPO Find N3', 'oppo-find-n3', 'Màn hình gập mỏng nhẹ, Camera Hasselblad', 'Mô tả chi tiết OPPO Find N3'],
      [28, 4, 4, 'OPPO Reno11 Pro 5G', 'oppo-reno11-pro', 'Chuyên gia chân dung AI', 'Mô tả chi tiết OPPO Reno11 Pro'],
      [29, 4, 4, 'OPPO Reno11 5G', 'oppo-reno11', 'Thiết kế mặt lưng sóng biển độc đáo', 'Mô tả chi tiết OPPO Reno11'],
      [30, 4, 4, 'OPPO A79 5G', 'oppo-a79-5g', 'Loa kép âm thanh sống động, Sạc 33W', 'Mô tả chi tiết OPPO A79']
    ];

    for (const p of productsData) {
      await client.query(`
        INSERT INTO "products" ("id", "category_id", "brand_id", "name", "slug", "short_description", "description", "status")
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE'::text::products_status)
        ON CONFLICT ("id") DO UPDATE SET
          "name" = EXCLUDED."name",
          "short_description" = EXCLUDED."short_description";
      `, p);
    }

    // 5. Product Variants (Biến thể tương ứng cho 30 sản phẩm)
    const basePrices = [
      30000000, 25000000, 22000000, 19000000, 24000000,
      21000000, 17000000, 14000000, 11000000, 9000000,
      31000000, 23000000, 18000000, 38000000, 20000000,
      8500000,  6500000,  5200000,  4300000,  12500000,
      29000000, 19500000, 10500000, 7200000,  4800000,
      8900000,  42000000, 16000000, 10000000, 6000000
    ];

    for (let i = 1; i <= 30; i++) {
      const price = basePrices[i - 1];
      const salePrice = price * 0.9; // Giảm giá 10%
      const sku = `SKU-PHONE-${i}`;
      const img = `/uploads/products/phone-${i}.webp`;

      await client.query(`
        INSERT INTO "product_variants" ("id", "product_id", "sku", "price", "sale_price", "stock_quantity", "image", "status")
        VALUES ($1, $2, $3, $4, $5, 50, $6, true)
        ON CONFLICT ("id") DO UPDATE SET
          "price" = EXCLUDED."price",
          "sale_price" = EXCLUDED."sale_price";
      `, [i, i, sku, price, salePrice, img]);
    }

    console.log("🎉 Nạp thành công Admin và 30 sản phẩm!");
  } catch (err) {
    console.error("❌ Lỗi nạp dữ liệu:", err.message);
    process.exit(0);
  } finally {
    await client.end();
  }
}

main();
