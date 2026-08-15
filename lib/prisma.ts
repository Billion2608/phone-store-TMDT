import { PrismaClient } from "@prisma/client";

// Khắc phục lỗi "Do not know how to serialize a BigInt" khi truyền dữ liệu
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;