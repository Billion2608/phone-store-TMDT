import { NextResponse } from "next/server";
import { Client } from "pg";

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
      return NextResponse.json({ error: "Thiếu tên sản phẩm, danh mục hoặc thương hiệu" }, { status: 400 });
    }

    // Tạo slug từ tên sản phẩm
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

    // Chuyển hướng về trang danh sách sản phẩm sau khi thêm thành công
    return NextResponse.redirect(new URL("/admin/products", request.url), 303);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
