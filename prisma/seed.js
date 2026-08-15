const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("🌱 Đang nạp dữ liệu bằng SQL thuần...");

  try {
    // 1. Users
    await client.query(`
      INSERT INTO "users" ("id", "email", "password", "full_name", "phone", "role", "status")
      VALUES 
        (1, 'admin@phonestore.com', '$2a$10$wT.N.u9JzY3lW5vR5vR5v.R5vR5vR5vR5vR5vR5vR5vR5vR5vR5v', 'Administrator', '0900444333', 'ADMIN', 'ACTIVE'),
        (2, 'user@phonestore.com', '$2a$10$wT.N.u9JzY3lW5vR5vR5v.R5vR5vR5vR5vR5vR5vR5vR5vR5vR5v', 'Test User', '0999888777', 'USER', 'ACTIVE')
      ON CONFLICT ("id") DO NOTHING;
    `);

    // 2. Categories & Brands
    await client.query(`
      INSERT INTO "categories" ("id", "name", "slug", "image", "status")
      VALUES (1, 'Iphone', 'iphone', '/uploads/products/1785859329187-5f60cf0d-0844-4ac6-b6a1-9720fe6c1b34.webp', true)
      ON CONFLICT ("id") DO NOTHING;
    `);

    await client.query(`
      INSERT INTO "brands" ("id", "name", "slug", "logo", "status")
      VALUES (1, 'Apple', 'apple', '/uploads/products/1785859364394-7b586e5a-7e5b-4f8e-99a9-0b97c8bd20e2.jpg', true)
      ON CONFLICT ("id") DO NOTHING;
    `);

    // 3. Products & Product Variants
    await client.query(`
      INSERT INTO "products" ("id", "category_id", "brand_id", "name", "slug", "short_description", "description", "status")
      VALUES (1, 1, 1, 'Iphone', 'iphone', 'Điện thoại Iphone chính hãng', 'Mô tả chi tiết sản phẩm Iphone', 'ACTIVE')
      ON CONFLICT ("id") DO NOTHING;
    `);

    await client.query(`
      INSERT INTO "product_variants" ("id", "product_id", "sku", "price", "sale_price", "stock_quantity", "image", "status")
      VALUES (1, 1, 'IPHONE', 1500000.0, 1300000.0, 145, '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', true)
      ON CONFLICT ("id") DO NOTHING;
    `);

    // 4. Orders
    await client.query(`
      INSERT INTO "orders" ("id", "order_code", "user_id", "receiver_name", "receiver_phone", "shipping_address", "subtotal", "shipping_fee", "total_amount", "payment_method", "payment_status", "status")
      VALUES 
        (1, 'PS20260804-D07CC57F', 1, 'Administrator', '0900444333', '32C, Phường Tân Hòa, Thành phố Vĩnh Long', 1300000.0, 30000.0, 1330000.0, 'COD', 'UNPAID', 'PENDING'),
        (2, 'PS20260804-2DA36E5E', 1, 'Administrator', '0900444333', '32C, Phường Tân Hòa, Thành phố Vĩnh Long', 1300000.0, 30000.0, 1330000.0, 'COD', 'UNPAID', 'PENDING'),
        (3, 'PS20260804-60A270F0', 2, 'Test', '0999888777', '54c, Phường Phúc Xá, Ba Đình, Hà Nội', 1300000.0, 30000.0, 1330000.0, 'COD', 'UNPAID', 'PENDING'),
        (4, 'PS20260804-CCB542D6', 2, 'Test', '0999888777', '54c, Phường Phúc Xá, Ba Đình, Hà Nội', 1300000.0, 30000.0, 1330000.0, 'VNPAY', 'UNPAID', 'PENDING'),
        (5, 'PS20260804-B7AE796D', 2, 'Test', '0999888777', '54c, Phường Phúc Xá, Ba Đình, Hà Nội', 1300000.0, 30000.0, 1330000.0, 'COD', 'UNPAID', 'PENDING')
      ON CONFLICT ("id") DO NOTHING;
    `);

    // 5. Order Items
    await client.query(`
      INSERT INTO "order_items" ("id", "order_id", "variant_id", "product_name", "sku", "product_image", "price", "quantity", "total_price")
      VALUES 
        (1, 1, 1, 'Iphone', 'IPHONE', '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', 1300000.0, 1, 1300000.0),
        (2, 2, 1, 'Iphone', 'IPHONE', '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', 1300000.0, 1, 1300000.0),
        (3, 3, 1, 'Iphone', 'IPHONE', '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', 1300000.0, 1, 1300000.0),
        (4, 4, 1, 'Iphone', 'IPHONE', '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', 1300000.0, 1, 1300000.0),
        (5, 5, 1, 'Iphone', 'IPHONE', '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', 1300000.0, 1, 1300000.0)
      ON CONFLICT ("id") DO NOTHING;
    `);

    // 6. Payments
    await client.query(`
      INSERT INTO "payments" ("id", "order_id", "payment_method", "amount", "status")
      VALUES 
        (1, 1, 'COD', 1330000.0, 'PENDING'),
        (2, 2, 'COD', 1330000.0, 'PENDING'),
        (3, 3, 'COD', 1330000.0, 'PENDING'),
        (4, 4, 'VNPAY', 1330000.0, 'PENDING'),
        (5, 5, 'COD', 1330000.0, 'PENDING')
      ON CONFLICT ("id") DO NOTHING;
    `);

    console.log("🎉 Nạp dữ liệu hoàn tất!");
  } catch (err) {
    console.error("❌ Lỗi nạp dữ liệu:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
