import { z } from "zod";

const optionalUrl = z.string().trim().max(500).optional().or(z.literal(""));
const id = z.string().regex(/^\d+$/);

export const specificationSchema = z.object({
  id: id.optional(),
  name: z.string().trim().min(1).max(150),
  value: z.string().trim().min(1).max(5000),
  sortOrder: z.number().int().min(0).default(0),
});
export const variantSchema = z
  .object({
    id: id.optional(),
    sku: z.string().trim().min(1).max(100),
    price: z.number().positive(),
    salePrice: z.number().positive().nullable().optional(),
    stock: z.number().int().min(0),
    image: optionalUrl,
    status: z.boolean().default(true),
    attributeValueIds: z.array(id).default([]),
  })
  .refine(
    (value) => value.salePrice == null || value.salePrice <= value.price,
    {
      message: "Giá khuyến mãi không được lớn hơn giá gốc.",
      path: ["salePrice"],
    },
  );

export const productSchema = z.object({
  name: z.string().trim().min(2).max(255),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(255),
  categoryId: id,
  brandId: id.nullable().optional(),
  shortDescription: z.string().trim().max(3000).optional(),
  description: z.string().trim().max(50000).optional(),
  thumbnail: optionalUrl,
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  images: z.array(z.string().trim().min(1).max(500)).max(20).default([]),
  specifications: z.array(specificationSchema).max(100).default([]),
  variants: z.array(variantSchema).min(1).max(100),
});

export const categorySchema = z.object({
  parentId: id.nullable().optional(),
  name: z.string().trim().min(1).max(150),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(150),
  image: optionalUrl,
  status: z.boolean(),
  sortOrder: z.number().int().min(0),
});
export const brandSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(120),
  logo: optionalUrl,
  description: z.string().trim().max(5000).optional(),
  status: z.boolean(),
});
export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .transform((value) => value.toUpperCase()),
    name: z.string().trim().max(150).optional(),
    discountType: z.enum(["PERCENT", "FIXED"]),
    discountValue: z.number().positive(),
    minOrderValue: z.number().min(0),
    maxDiscount: z.number().positive().nullable().optional(),
    usageLimit: z.number().int().min(0).nullable().optional(),
    startDate: z.string().datetime().nullable().optional(),
    endDate: z.string().datetime().nullable().optional(),
    status: z.boolean(),
  })
  .refine(
    (value) => value.discountType !== "PERCENT" || value.discountValue <= 100,
    {
      message: "Giảm theo phần trăm không được vượt quá 100%.",
      path: ["discountValue"],
    },
  )
  .refine(
    (value) =>
      !value.startDate ||
      !value.endDate ||
      new Date(value.startDate) < new Date(value.endDate),
    { message: "Ngày bắt đầu phải trước ngày kết thúc.", path: ["endDate"] },
  );

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "SHIPPING",
    "COMPLETED",
    "CANCELLED",
  ]),
  note: z.string().trim().max(1000).optional(),
  cancelledReason: z.string().trim().max(1000).optional(),
});
export const userAccessSchema = z
  .object({
    status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
    role: z.enum(["CUSTOMER", "ADMIN"]).optional(),
  })
  .refine(
    (value) => value.status || value.role,
    "Không có thay đổi quyền truy cập.",
  );
export const bannerSchema = z.object({
  title: z.string().trim().min(2).max(200),
  subtitle: z.string().trim().max(500).optional(),
  imageUrl: z.string().trim().min(1).max(500),
  linkUrl: z.string().trim().max(500).optional(),
  buttonText: z.string().trim().max(80).optional(),
  sortOrder: z.number().int().min(0).default(0),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  status: z.boolean().default(true),
});
export const reviewStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});
