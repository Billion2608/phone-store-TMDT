import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu nạp dữ liệu bằng Raw SQL (Bỏ qua validation)...");

  // 1. Nạp Users
  await prisma.$executeRawUnsafe(`
    INSERT INTO "users" (id, email, password, full_name, phone, role, status)
    VALUES 
      (1, 'admin@phonestore.com', '$2a$10$wT.N.u9JzY3lW5vR5vR5v.R5vR5vR5vR5vR5vR5vR5vR5vR5vR5v', 'Administrator', '0900444333', 'ADMIN'::users_role, 'ACTIVE'::users_status),
      (2, 'user@phonestore.com', '$2a$10$wT.N.u9JzY3lW5vR5vR5v.R5vR5vR5vR5vR5vR5vR5vR5vR5vR5v', 'Test User', '0999888777', 'USER'::users_role, 'ACTIVE'::users_status)
    ON CONFLICT (id) DO NOTHING;
  `);

  // 2. Nạp Categories & Brands
  await prisma.$executeRawUnsafe(`
    INSERT INTO "categories" (id, name, slug, image, status)
    VALUES (1, 'Iphone', 'iphone', '/uploads/products/1785859329187-5f60cf0d-0844-4ac6-b6a1-9720fe6c1b34.webp', true)
    ON CONFLICT (id) DO NOTHING;
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "brands" (id, name, slug, logo, status)
    VALUES (1, 'Apple', 'apple', '/uploads/products/1785859364394-7b586e5a-7e5b-4f8e-99a9-0b97c8bd20e2.jpg', true)
    ON CONFLICT (id) DO NOTHING;
  `);

  // 3. Nạp Products & Product Variants
  await prisma.$executeRawUnsafe(`
    INSERT INTO "products" (id, category_id, brand_id, name, slug, short_description, description, status)
    VALUES (1, 1, 1, 'Iphone', 'iphone', 'Điện thoại Iphone chính hãng', 'Mô tả chi tiết sản phẩm Iphone', 'ACTIVE'::products_status)
    ON CONFLICT (id) DO NOTHING;
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "product_variants" (id, product_id, sku, price, sale_price, stock_quantity, image, status)
    VALUES (1, 1, 'IPHONE', 1500000.00, 1300000.00, 145, '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', true)
    ON CONFLICT (id) DO NOTHING;
  `);

  // 4. Nạp Orders, Order Items & Payments
  await prisma.$executeRawUnsafe(`
    INSERT INTO "orders" (id, order_code, user_id, receiver_name, receiver_phone, shipping_address, subtotal, shipping_fee, total_amount, payment_method, payment_status, status)
    VALUES 
      (1, 'PS20260804-D07CC57F', 1, 'Administrator', '0900444333', '32C, Phường Tân Hòa, Thành phố Vĩnh Long, Tỉnh Vĩnh Long', 1300000.00, 30000.00, 1330000.00, 'COD'::orders_payment_method, 'UNPAID'::orders_payment_status, 'PENDING'::orders_status),
      (2, 'PS20260804-2DA36E5E', 1, 'Administrator', '0900444333', '32C, Phường Tân Hòa, Thành phố Vĩnh Long, Tỉnh Vĩnh Long', 1300000.00, 30000.00, 1330000.00, 'COD'::orders_payment_method, 'UNPAID'::orders_payment_status, 'PENDING'::orders_status),
      (3, 'PS20260804-60A270F0', 2, 'Test', '0999888777', '54c, Phường Phúc Xá, Quận Ba Đình, Thành phố Hà Nội', 1300000.00, 30000.00, 1330000.00, 'COD'::orders_payment_method, 'UNPAID'::orders_payment_status, 'PENDING'::orders_status),
      (4, 'PS20260804-CCB542D6', 2, 'Test', '0999888777', '54c, Phường Phúc Xá, Quận Ba Đình, Thành phố Hà Nội', 1300000.00, 30000.00, 1330000.00, 'VNPAY'::orders_payment_method, 'UNPAID'::orders_payment_status, 'PENDING'::orders_status),
      (5, 'PS20260804-B7AE796D', 2, 'Test', '0999888777', '54c, Phường Phúc Xá, Quận Ba Đình, Thành phố Hà Nội', 1300000.00, 30000.00, 1330000.00, 'COD'::orders_payment_method, 'UNPAID'::orders_payment_status, 'PENDING'::orders_status)
    ON CONFLICT (id) DO NOTHING;
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "order_items" (id, order_id, variant_id, product_name, sku, product_image, price, quantity, total_price)
    VALUES 
      (1, 1, 1, 'Iphone', 'IPHONE', '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', 1300000.00, 1, 1300000.00),
      (2, 2, 1, 'Iphone', 'IPHONE', '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', 1300000.00, 1, 1300000.00),
      (3, 3, 1, 'Iphone', 'IPHONE', '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', 1300000.00, 1, 1300000.00),
      (4, 4, 1, 'Iphone', 'IPHONE', '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', 1300000.00, 1, 1300000.00),
      (5, 5, 1, 'Iphone', 'IPHONE', '/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp', 1300000.00, 1, 1300000.00)
    ON CONFLICT (id) DO NOTHING;
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO "payments" (id, order_id, payment_method, amount, status)
    VALUES 
      (1, 1, 'COD'::payments_payment_method, 1330000.00, 'PENDING'::payments_status),
      (2, 2, 'COD'::payments_payment_method, 1330000.00, 'PENDING'::payments_status),
      (3, 3, 'COD'::payments_payment_method, 1330000.00, 'PENDING'::payments_status),
      (4, 4, 'VNPAY'::payments_payment_method, 1330000.00, 'PENDING'::payments_status),
      (5, 5, 'COD'::payments_payment_method, 1330000.00, 'PENDING'::payments_status)
    ON CONFLICT (id) DO NOTHING;
  `);

  console.log("🎉 Hoàn tất nạp dữ liệu bằng Raw SQL thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
