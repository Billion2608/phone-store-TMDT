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

    // Mã hóa mật khẩu admin@1234
    const hashedPassword = await bcrypt.hash("admin@1234", 10);

    // Xóa tài khoản cũ nếu có và thêm lại tài khoản Admin mới chuẩn xác
    await client.query(`
      INSERT INTO "users" ("email", "password", "full_name", "phone", "role", "status")
      VALUES ('admin@gmail.com', '${hashedPassword}', 'Administrator', '0900444333', 'ADMIN'::text::users_role, 'ACTIVE'::text::users_status)
      ON CONFLICT ("email") DO UPDATE SET 
        "password" = '${hashedPassword}',
        "role" = 'ADMIN'::text::users_role,
        "status" = 'ACTIVE'::text::users_status;
    `);

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
