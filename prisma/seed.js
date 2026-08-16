const { Client } = require("pg");
const bcrypt = require("bcryptjs");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("🌱 Đang nạp dữ liệu Admin và 30 sản phẩm điện thoại...");

  try {
    // Tạo hash chuẩn cho mật khẩu "admin@1234"
    const defaultPasswordHash = bcrypt.hashSync("admin@1234", 10);

    await client.query(`
      DELETE FROM "users" 
      WHERE "email" IN ('admin@gmail.com', 'user@phonestore.com') 
         OR "phone" IN ('0900444333', '0999888777');
    `);

    await client.query(
      `
      INSERT INTO "users" ("email", "password", "full_name", "phone", "role", "status", "created_at", "updated_at")
      VALUES 
        ('admin@gmail.com', $1, 'Administrator', '0900444333', 'ADMIN'::text::users_role, 'ACTIVE'::text::users_status, NOW(), NOW()),
        ('user@phonestore.com', $1, 'Test User', '0999888777', 'USER'::text::users_role, 'ACTIVE'::text::users_status, NOW(), NOW());
    `,
      [defaultPasswordHash]
    );

    // ... Giữ nguyên phần insert categories, brands, products ở dưới ...
    console.log("🎉 Nạp thành công Admin (Mật khẩu: admin@1234)!");
  } catch (err) {
    console.error("❌ Lỗi nạp dữ liệu:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
