import {
  PrismaClient,
  users_role,
  users_status,
  products_status,
  orders_payment_method,
  orders_payment_status,
  orders_status,
  payments_status,
  payments_payment_method,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu nạp dữ liệu chuẩn với Prisma Client...");

  // 1. Nạp Người dùng (Users)
  await prisma.users.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      email: "admin@phonestore.com",
      password: "$2a$10$wT.N.u9JzY3lW5vR5vR5v.R5vR5vR5vR5vR5vR5vR5vR5vR5vR5v",
      full_name: "Administrator",
      phone: "0900444333",
      role: users_role.ADMIN,
      status: users_status.ACTIVE,
    },
  });

  await prisma.users.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      email: "user@phonestore.com",
      password: "$2a$10$wT.N.u9JzY3lW5vR5vR5v.R5vR5vR5vR5vR5vR5vR5vR5vR5vR5v",
      full_name: "Test User",
      phone: "0999888777",
      role: users_role.USER,
      status: users_status.ACTIVE,
    },
  });

  // 2. Nạp Danh mục & Thương hiệu
  await prisma.categories.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Iphone",
      slug: "iphone",
      image: "/uploads/products/1785859329187-5f60cf0d-0844-4ac6-b6a1-9720fe6c1b34.webp",
      status: true,
    },
  });

  await prisma.brands.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Apple",
      slug: "apple",
      logo: "/uploads/products/1785859364394-7b586e5a-7e5b-4f8e-99a9-0b97c8bd20e2.jpg",
      status: true,
    },
  });

  // 3. Nạp Sản phẩm & Biến thể
  const product1 = await prisma.products.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      category_id: 1,
      brand_id: 1,
      name: "Iphone",
      slug: "iphone",
      short_description: "Điện thoại Iphone chính hãng",
      description: "Mô tả chi tiết sản phẩm Iphone",
      status: products_status.ACTIVE,
    },
  });

  const variant1 = await prisma.product_variants.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      product_id: product1.id,
      sku: "IPHONE",
      price: 1500000.0,
      sale_price: 1300000.0,
      stock_quantity: 145,
      image: "/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp",
      status: true,
    },
  });

  // 4. Nạp Hóa đơn / Đơn hàng
  const ordersData = [
    { id: 1, code: "PS20260804-D07CC57F", userId: 1, name: "Administrator", phone: "0900444333", address: "32C, Phường Tân Hòa, Thành phố Vĩnh Long, Tỉnh Vĩnh Long", total: 1330000.0, method: orders_payment_method.COD, payMethod: payments_payment_method.COD },
    { id: 2, code: "PS20260804-2DA36E5E", userId: 1, name: "Administrator", phone: "0900444333", address: "32C, Phường Tân Hòa, Thành phố Vĩnh Long, Tỉnh Vĩnh Long", total: 1330000.0, method: orders_payment_method.COD, payMethod: payments_payment_method.COD },
    { id: 3, code: "PS20260804-60A270F0", userId: 2, name: "Test", phone: "0999888777", address: "54c, Phường Phúc Xá, Quận Ba Đình, Thành phố Hà Nội", total: 1330000.0, method: orders_payment_method.COD, payMethod: payments_payment_method.COD },
    { id: 4, code: "PS20260804-CCB542D6", userId: 2, name: "Test", phone: "0999888777", address: "54c, Phường Phúc Xá, Quận Ba Đình, Thành phố Hà Nội", total: 1330000.0, method: orders_payment_method.VNPAY, payMethod: payments_payment_method.VNPAY },
    { id: 5, code: "PS20260804-B7AE796D", userId: 2, name: "Test", phone: "0999888777", address: "54c, Phường Phúc Xá, Quận Ba Đình, Thành phố Hà Nội", total: 1330000.0, method: orders_payment_method.COD, payMethod: payments_payment_method.COD },
  ];

  for (const o of ordersData) {
    await prisma.orders.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        order_code: o.code,
        user_id: o.userId,
        receiver_name: o.name,
        receiver_phone: o.phone,
        shipping_address: o.address,
        subtotal: 1300000.0,
        shipping_fee: 30000.0,
        total_amount: o.total,
        payment_method: o.method,
        payment_status: orders_payment_status.UNPAID,
        status: orders_status.PENDING,
      },
    });

    await prisma.order_items.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        order_id: o.id,
        variant_id: variant1.id,
        product_name: "Iphone",
        sku: "IPHONE",
        product_image: "/uploads/products/1785859450889-487f4066-85a2-46f5-92ab-977f32d6b8af.webp",
        price: 1300000.0,
        quantity: 1,
        total_price: 1300000.0,
      },
    });

    await prisma.payments.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        order_id: o.id,
        payment_method: o.payMethod,
        amount: o.total,
        status: payments_status.PENDING,
      },
    });
  }

  console.log("🎉 Hoàn tất nạp dữ liệu!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
