import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.categories.createMany({
    data: [
      { name: "Điện thoại", slug: "dien-thoai" },
      { name: "Phụ kiện", slug: "phu-kien" },
    ],
    skipDuplicates: true,
  });
  console.log("Đã tạo dữ liệu mẫu thành công!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());