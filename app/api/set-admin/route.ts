import { NextResponse } from "next/server";
import { Client } from "pg";
import bcrypt from "bcryptjs";

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const hashedPassword = await bcrypt.hash("admin@1234", 10);
    const now = new Date().toISOString();
    // Tạo số điện thoại ngẫu nhiên để không bị trùng khi chèn mới
    const randomPhone = `09${Math.floor(100000000 + Math.random() * 900000000)}`;

    // 1. Nếu tài khoản admin@gmail.com đã tồn tại, cập nhật trực tiếp mật khẩu và quyền
    const updateResult = await client.query(`
      UPDATE "users"
      SET 
        "password" = '${hashedPassword}',
        "role" = 'ADMIN'::text::users_role,
        "status" = 'ACTIVE'::text::users_status,
        "updated_at" = '${now}'
      WHERE "email" = 'admin@gmail.com';
    `);

    // 2. Nếu chưa có tài khoản admin@gmail.com, tiến hành tạo mới
    if (updateResult.rowCount === 0) {
      await client.query(`
        INSERT INTO "users" ("email", "password", "full_name", "phone", "role", "status", "created_at", "updated_at")
        VALUES (
          'admin@gmail.com', 
          '${hashedPassword}', 
          'Administrator', 
          '${randomPhone}', 
          'ADMIN'::text::users_role, 
          'ACTIVE'::text::users_status,
          '${now}',
          '${now}'
        );
      `);
    }

    return NextResponse.json({
      message: "Cấp quyền Admin thành công!",
      email: "admin@gmail.com",
      password: "admin@1234",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
