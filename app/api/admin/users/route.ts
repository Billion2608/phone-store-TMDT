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

    // 1. Tạo bảng users nếu chưa có (tự động khôi phục cấu trúc)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "full_name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(20),
        "address" TEXT,
        "role" VARCHAR(20) DEFAULT 'USER',
        "status" VARCHAR(20) DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Danh sách 10 người dùng mẫu
    // Mật khẩu mặc định đặt dạng hashed/plain để bạn test dễ dàng: 123456
    const sampleUsers = [
      {
        full_name: "Quản Trị Viên (Admin)",
        email: "admin@phonestore.com",
        password: "$2a$10$abcdefghijklmnopqrstuu1234567890", // Hoặc mật khẩu plain nếu dự án chưa hash
        phone: "0901234567",
        address: "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh",
        role: "ADMIN",
      },
      {
        full_name: "Nhân Viên Trực Cửa Hàng 1",
        email: "staff1@phonestore.com",
        password: "$2a$10$abcdefghijklmnopqrstuu1234567890",
        phone: "0912345678",
        address: "456 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
        role: "STAFF",
      },
      {
        full_name: "Nhân Viên Kho 2",
        email: "staff2@phonestore.com",
        password: "$2a$10$abcdefghijklmnopqrstuu1234567890",
        phone: "0923456789",
        address: "789 Đường Cách Mạng Tháng 8, Quận 3, TP. Hồ Chí Minh",
        role: "STAFF",
      },
      {
        full_name: "Nguyễn Văn An",
        email: "nguyenvanan@gmail.com",
        password: "$2a$10$abcdefghijklmnopqrstuu1234567890",
        phone: "0987654321",
        address: "12 Đường Phạm Văn Đồng, Cầu Giấy, Hà Nội",
        role: "USER",
      },
      {
        full_name: "Trần Thị Bích",
        email: "tranthibich@gmail.com",
        password: "$2a$10$abcdefghijklmnopqrstuu1234567890",
        phone: "0978123456",
        address: "88 Đường Hoàng Diệu, Hải Châu, Đà Nẵng",
        role: "USER",
      },
      {
        full_name: "Lê Hoàng Nam",
        email: "lehoangnam@yahoo.com",
        password: "$2a$10$abcdefghijklmnopqrstuu1234567890",
        phone: "0965432187",
        address: "15 Đường 3 Tháng 2, Ninh Kiều, Cần Thơ",
        role: "USER",
      },
      {
        full_name: "Phạm Minh Tuấn",
        email: "phamminhtuan@outlook.com",
        password: "$2a$10$abcdefghijklmnopqrstuu1234567890",
        phone: "0954321876",
        address: "234 Đường Nguyễn Văn Cừ, Long Biên, Hà Nội",
        role: "USER",
      },
      {
        full_name: "Vũ Phương Thảo",
        email: "vuphuongthao@gmail.com",
        password: "$2a$10$abcdefghijklmnopqrstuu1234567890",
        phone: "0943218765",
        address: "56 Đường Trần Hưng Đạo, Ninh Kiều, Cần Thơ",
        role: "USER",
      },
      {
        full_name: "Đặng Quốc Anh",
        email: "dangquocanh@gmail.com",
        password: "$2a$10$abcdefghijklmnopqrstuu1234567890",
        phone: "0932187654",
        address: "102 Đường Quang Trung, Gò Vấp, TP. Hồ Chí Minh",
        role: "USER",
      },
      {
        full_name: "Bùi Thị Khánh Linh",
        email: "buithikhanhlinh@gmail.com",
        password: "$2a$10$abcdefghijklmnopqrstuu1234567890",
        phone: "0921876543",
        address: "45 Đường Võ Văn Kiệt, Quận 5, TP. Hồ Chí Minh",
        role: "USER",
      },
    ];

    let createdCount = 0;

    for (const u of sampleUsers) {
      await client.query(`
        INSERT INTO "users" ("full_name", "email", "password", "phone", "address", "role", "status", "created_at", "updated_at")
        VALUES (
          '${u.full_name.replace(/'/g, "''")}',
          '${u.email}',
          '${u.password}',
          '${u.phone}',
          '${u.address.replace(/'/g, "''")}',
          '${u.role}',
          'ACTIVE',
          '${now}',
          '${now}'
        )
        ON CONFLICT ("email") DO UPDATE SET
          "full_name" = EXCLUDED."full_name",
          "phone" = EXCLUDED."phone",
          "address" = EXCLUDED."address",
          "role" = EXCLUDED."role";
      `);
      createdCount++;
    }

    return NextResponse.json({
      message: `Đã khởi tạo/cập nhật thành công ${createdCount} người dùng vào hệ thống!`,
      users: sampleUsers.map((u) => ({
        name: u.full_name,
        email: u.email,
        role: u.role,
        phone: u.phone,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
