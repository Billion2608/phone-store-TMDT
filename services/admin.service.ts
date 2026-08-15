import { Prisma } from "@/generated/prisma/client";
import { canTransitionOrder } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";
import { BusinessError } from "@/lib/route-error";
import type { AdminProductInput } from "@/types/admin";
import type { OrderStatus } from "@/types/order";

export async function getDashboard() {
  const [
    revenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
    statuses,
  ] = await Promise.all([
    prisma.orders.aggregate({
      where: { status: "COMPLETED" },
      _sum: { total_amount: true },
    }),
    prisma.orders.count(),
    prisma.products.count(),
    prisma.users.count({ where: { role: "CUSTOMER" } }),
    prisma.orders.findMany({
      take: 8,
      orderBy: { created_at: "desc" },
      include: { users: { select: { full_name: true } } },
    }),
    prisma.orders.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  return {
    revenue: Number(revenue._sum.total_amount ?? 0),
    totalOrders,
    totalProducts,
    totalCustomers,
    statuses: Object.fromEntries(
      statuses.map((item) => [item.status, item._count._all]),
    ),
    recentOrders: recentOrders.map((order) => ({
      id: order.id.toString(),
      code: order.order_code,
      customer: order.users.full_name,
      total: Number(order.total_amount),
      status: order.status,
      createdAt: order.created_at.toISOString(),
    })),
  };
}

export async function getAdminProducts() {
  const rows = await prisma.products.findMany({
    orderBy: { created_at: "desc" },
    include: {
      brands: { select: { name: true } },
      categories: { select: { name: true } },
      product_variants: { select: { stock_quantity: true } },
    },
  });
  return rows.map((product) => ({
    id: product.id.toString(),
    name: product.name,
    slug: product.slug,
    thumbnail: product.thumbnail,
    brand: product.brands?.name ?? "—",
    category: product.categories.name,
    status: product.status,
    featured: product.featured,
    variants: product.product_variants.length,
    stock: product.product_variants.reduce(
      (sum, variant) => sum + variant.stock_quantity,
      0,
    ),
    createdAt: product.created_at.toISOString(),
  }));
}

export async function getProductFormOptions() {
  const [categories, brands, attributes] = await Promise.all([
    prisma.categories.findMany({
      orderBy: [{ sort_order: "asc" }, { name: "asc" }],
      select: { id: true, name: true, parent_id: true },
    }),
    prisma.brands.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.attributes.findMany({
      orderBy: { name: "asc" },
      include: { attribute_values: { orderBy: { value: "asc" } } },
    }),
  ]);
  return {
    categories: categories.map((item) => ({
      id: item.id.toString(),
      name: item.name,
      parentId: item.parent_id?.toString() ?? null,
    })),
    brands: brands.map((item) => ({ id: item.id.toString(), name: item.name })),
    attributes: attributes.map((item) => ({
      id: item.id.toString(),
      name: item.name,
      values: item.attribute_values.map((value) => ({
        id: value.id.toString(),
        value: value.value,
      })),
    })),
  };
}

export async function getAdminProduct(id: string) {
  const product = await prisma.products.findUnique({
    where: { id: BigInt(id) },
    include: {
      product_images: { orderBy: { sort_order: "asc" } },
      product_specifications: { orderBy: { sort_order: "asc" } },
      product_variants: {
        orderBy: { created_at: "asc" },
        include: {
          variant_attribute_values: { select: { attribute_value_id: true } },
        },
      },
    },
  });
  if (!product) return null;
  return {
    id: product.id.toString(),
    name: product.name,
    slug: product.slug,
    categoryId: product.category_id.toString(),
    brandId: product.brand_id?.toString() ?? null,
    shortDescription: product.short_description ?? "",
    description: product.description ?? "",
    thumbnail: product.thumbnail ?? "",
    featured: product.featured,
    status: product.status,
    images: product.product_images.map((item) => item.image_url),
    specifications: product.product_specifications.map((item) => ({
      id: item.id.toString(),
      name: item.spec_name,
      value: item.spec_value,
      sortOrder: item.sort_order,
    })),
    variants: product.product_variants.map((item) => ({
      id: item.id.toString(),
      sku: item.sku,
      price: Number(item.price),
      salePrice: item.sale_price ? Number(item.sale_price) : null,
      stock: item.stock_quantity,
      image: item.image ?? "",
      status: item.status,
      attributeValueIds: item.variant_attribute_values.map((value) =>
        value.attribute_value_id.toString(),
      ),
    })),
  };
}

async function validateProductRelations(
  tx: Prisma.TransactionClient,
  input: AdminProductInput,
) {
  const [category, brandCount, values] = await Promise.all([
    tx.categories.findUnique({
      where: { id: BigInt(input.categoryId) },
      select: { id: true },
    }),
    input.brandId
      ? tx.brands.count({ where: { id: BigInt(input.brandId) } })
      : Promise.resolve(1),
    tx.attribute_values.count({
      where: {
        id: {
          in: [
            ...new Set(
              input.variants
                .flatMap((variant) => variant.attributeValueIds)
                .map(BigInt),
            ),
          ],
        },
      },
    }),
  ]);
  const expectedValues = new Set(
    input.variants.flatMap((variant) => variant.attributeValueIds),
  ).size;
  if (!category || !brandCount)
    throw new BusinessError("Danh mục hoặc thương hiệu không hợp lệ.", 422);
  if (values !== expectedValues)
    throw new BusinessError("Có giá trị thuộc tính không hợp lệ.", 422);
}

export async function createAdminProduct(input: AdminProductInput) {
  return prisma.$transaction(async (tx) => {
    await validateProductRelations(tx, input);
    const product = await tx.products.create({
      data: {
        name: input.name,
        slug: input.slug,
        category_id: BigInt(input.categoryId),
        brand_id: input.brandId ? BigInt(input.brandId) : null,
        short_description: input.shortDescription || null,
        description: input.description || null,
        thumbnail: input.thumbnail || null,
        featured: input.featured,
        status: input.status,
      },
    });
    if (input.images.length)
      await tx.product_images.createMany({
        data: input.images.map((image, index) => ({
          product_id: product.id,
          image_url: image,
          sort_order: index,
        })),
      });
    if (input.specifications.length)
      await tx.product_specifications.createMany({
        data: input.specifications.map((spec, index) => ({
          product_id: product.id,
          spec_name: spec.name,
          spec_value: spec.value,
          sort_order: spec.sortOrder ?? index,
        })),
      });
    for (const variant of input.variants) {
      const created = await tx.product_variants.create({
        data: {
          product_id: product.id,
          sku: variant.sku,
          price: variant.price,
          sale_price: variant.salePrice ?? null,
          stock_quantity: variant.stock,
          image: variant.image || null,
          status: variant.status,
        },
      });
      if (variant.attributeValueIds.length)
        await tx.variant_attribute_values.createMany({
          data: variant.attributeValueIds.map((valueId) => ({
            variant_id: created.id,
            attribute_value_id: BigInt(valueId),
          })),
        });
    }
    return { id: product.id.toString() };
  });
}

export async function updateAdminProduct(id: string, input: AdminProductInput) {
  return prisma.$transaction(async (tx) => {
    const productId = BigInt(id);
    if (!(await tx.products.count({ where: { id: productId } })))
      throw new BusinessError("Không tìm thấy sản phẩm.", 404);
    await validateProductRelations(tx, input);
    await tx.products.update({
      where: { id: productId },
      data: {
        name: input.name,
        slug: input.slug,
        category_id: BigInt(input.categoryId),
        brand_id: input.brandId ? BigInt(input.brandId) : null,
        short_description: input.shortDescription || null,
        description: input.description || null,
        thumbnail: input.thumbnail || null,
        featured: input.featured,
        status: input.status,
      },
    });
    await tx.product_images.deleteMany({ where: { product_id: productId } });
    if (input.images.length)
      await tx.product_images.createMany({
        data: input.images.map((image, index) => ({
          product_id: productId,
          image_url: image,
          sort_order: index,
        })),
      });
    await tx.product_specifications.deleteMany({
      where: { product_id: productId },
    });
    if (input.specifications.length)
      await tx.product_specifications.createMany({
        data: input.specifications.map((spec, index) => ({
          product_id: productId,
          spec_name: spec.name,
          spec_value: spec.value,
          sort_order: spec.sortOrder ?? index,
        })),
      });
    const retainedVariantIds: bigint[] = [];
    for (const variant of input.variants) {
      let variantId: bigint;
      if (variant.id) {
        const existing = await tx.product_variants.findFirst({
          where: { id: BigInt(variant.id), product_id: productId },
          select: { id: true },
        });
        if (!existing)
          throw new BusinessError("Phiên bản không thuộc sản phẩm.", 422);
        variantId = existing.id;
        await tx.product_variants.update({
          where: { id: variantId },
          data: {
            sku: variant.sku,
            price: variant.price,
            sale_price: variant.salePrice ?? null,
            stock_quantity: variant.stock,
            image: variant.image || null,
            status: variant.status,
          },
        });
      } else {
        const created = await tx.product_variants.create({
          data: {
            product_id: productId,
            sku: variant.sku,
            price: variant.price,
            sale_price: variant.salePrice ?? null,
            stock_quantity: variant.stock,
            image: variant.image || null,
            status: variant.status,
          },
        });
        variantId = created.id;
      }
      await tx.variant_attribute_values.deleteMany({
        where: { variant_id: variantId },
      });
      if (variant.attributeValueIds.length)
        await tx.variant_attribute_values.createMany({
          data: variant.attributeValueIds.map((valueId) => ({
            variant_id: variantId,
            attribute_value_id: BigInt(valueId),
          })),
        });
      retainedVariantIds.push(variantId);
    }
    const removedVariants = await tx.product_variants.findMany({
      where: { product_id: productId, id: { notIn: retainedVariantIds } },
      include: { _count: { select: { order_items: true, cart_items: true } } },
    });
    for (const variant of removedVariants) {
      if (variant._count.order_items || variant._count.cart_items) {
        await tx.product_variants.update({
          where: { id: variant.id },
          data: { status: false },
        });
      } else {
        await tx.product_variants.delete({ where: { id: variant.id } });
      }
    }
    return { id };
  });
}

export async function archiveAdminProduct(id: string) {
  await prisma.products.update({
    where: { id: BigInt(id) },
    data: { status: "INACTIVE" },
  });
  return { id };
}

export async function getAdminCategories() {
  const rows = await prisma.categories.findMany({
    orderBy: [{ sort_order: "asc" }, { name: "asc" }],
    include: {
      categories: { select: { name: true } },
      _count: { select: { products: true, other_categories: true } },
    },
  });
  return rows.map((item) => ({
    id: item.id.toString(),
    parentId: item.parent_id?.toString() ?? null,
    parentName: item.categories?.name ?? null,
    name: item.name,
    slug: item.slug,
    image: item.image,
    status: item.status,
    sortOrder: item.sort_order,
    productCount: item._count.products,
    childCount: item._count.other_categories,
  }));
}

export async function saveAdminCategory(
  id: string | null,
  input: {
    parentId?: string | null;
    name: string;
    slug: string;
    image?: string;
    status: boolean;
    sortOrder: number;
  },
) {
  if (id && input.parentId === id)
    throw new BusinessError("Danh mục không thể là cha của chính nó.", 422);
  const data = {
    parent_id: input.parentId ? BigInt(input.parentId) : null,
    name: input.name,
    slug: input.slug,
    image: input.image || null,
    status: input.status,
    sort_order: input.sortOrder,
  };
  const result = id
    ? await prisma.categories.update({ where: { id: BigInt(id) }, data })
    : await prisma.categories.create({ data });
  return { id: result.id.toString() };
}

export async function deleteAdminCategory(id: string) {
  const category = await prisma.categories.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { products: true, other_categories: true } } },
  });
  if (!category) throw new BusinessError("Không tìm thấy danh mục.", 404);
  if (category._count.products || category._count.other_categories)
    throw new BusinessError(
      "Không thể xóa danh mục đang có sản phẩm hoặc danh mục con.",
      409,
    );
  await prisma.categories.delete({ where: { id: category.id } });
  return { id };
}

export async function getAdminBrands() {
  const rows = await prisma.brands.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return rows.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    slug: item.slug,
    logo: item.logo,
    description: item.description,
    status: item.status,
    productCount: item._count.products,
  }));
}

export async function saveAdminBrand(
  id: string | null,
  input: {
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    status: boolean;
  },
) {
  const data = {
    name: input.name,
    slug: input.slug,
    logo: input.logo || null,
    description: input.description || null,
    status: input.status,
  };
  const result = id
    ? await prisma.brands.update({ where: { id: BigInt(id) }, data })
    : await prisma.brands.create({ data });
  return { id: result.id.toString() };
}

export async function deleteAdminBrand(id: string) {
  const brand = await prisma.brands.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { products: true } } },
  });
  if (!brand) throw new BusinessError("Không tìm thấy thương hiệu.", 404);
  if (brand._count.products)
    throw new BusinessError("Không thể xóa thương hiệu đang có sản phẩm.", 409);
  await prisma.brands.delete({ where: { id: brand.id } });
  return { id };
}

export async function getAdminOrders(
  filters: { status?: OrderStatus; search?: string } = {},
) {
  const rows = await prisma.orders.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search
        ? {
            OR: [
              { order_code: { contains: filters.search } },
              { receiver_name: { contains: filters.search } },
              { receiver_phone: { contains: filters.search } },
            ],
          }
        : {}),
    },
    orderBy: { created_at: "desc" },
    include: {
      users: { select: { full_name: true, email: true } },
      _count: { select: { order_items: true } },
    },
    take: 200,
  });
  return rows.map((item) => ({
    id: item.id.toString(),
    code: item.order_code,
    customer: item.users.full_name,
    email: item.users.email,
    receiver: item.receiver_name,
    total: Number(item.total_amount),
    paymentStatus: item.payment_status,
    status: item.status,
    itemCount: item._count.order_items,
    createdAt: item.created_at.toISOString(),
  }));
}

export async function getAdminOrder(id: string) {
  const order = await prisma.orders.findUnique({
    where: { id: BigInt(id) },
    include: {
      users: {
        select: { id: true, full_name: true, email: true, phone: true },
      },
      order_items: true,
      payments: { orderBy: { created_at: "desc" } },
      order_status_history: {
        orderBy: { created_at: "asc" },
        include: { users: { select: { full_name: true } } },
      },
    },
  });
  if (!order) return null;
  return {
    id: order.id.toString(),
    code: order.order_code,
    customer: {
      id: order.users.id.toString(),
      name: order.users.full_name,
      email: order.users.email,
      phone: order.users.phone,
    },
    receiverName: order.receiver_name,
    receiverPhone: order.receiver_phone,
    shippingAddress: order.shipping_address,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount_amount),
    shippingFee: Number(order.shipping_fee),
    total: Number(order.total_amount),
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    status: order.status,
    note: order.note,
    cancelledReason: order.cancelled_reason,
    createdAt: order.created_at.toISOString(),
    items: order.order_items.map((item) => ({
      id: item.id.toString(),
      name: item.product_name,
      variant: item.variant_name,
      sku: item.sku,
      image: item.product_image,
      price: Number(item.price),
      quantity: item.quantity,
      total: Number(item.total_price),
    })),
    payments: order.payments.map((item) => ({
      id: item.id.toString(),
      method: item.payment_method,
      status: item.status,
      amount: Number(item.amount),
      createdAt: item.created_at.toISOString(),
    })),
    history: order.order_status_history.map((item) => ({
      id: item.id.toString(),
      oldStatus: item.old_status,
      newStatus: item.new_status,
      note: item.note,
      changedBy: item.users?.full_name ?? "Hệ thống",
      createdAt: item.created_at.toISOString(),
    })),
  };
}

export async function updateAdminOrderStatus(
  adminId: string,
  orderId: string,
  nextStatus: OrderStatus,
  note?: string,
  cancelledReason?: string,
) {
  // Kiểm tra chuyển trạng thái ở backend để không thể bỏ qua quy trình bằng cách gọi API trực tiếp.
  return prisma.$transaction(async (tx) => {
    const order = await tx.orders.findUnique({
      where: { id: BigInt(orderId) },
      select: {
        id: true,
        status: true,
        payment_method: true,
        order_items: {
          select: {
            variant_id: true,
            quantity: true,
            product_variants: { select: { product_id: true } },
          },
        },
      },
    });
    if (!order) throw new BusinessError("Không tìm thấy đơn hàng.", 404);
    if (!canTransitionOrder(order.status as OrderStatus, nextStatus))
      throw new BusinessError(
        `Không thể chuyển từ ${order.status} sang ${nextStatus}.`,
        409,
      );
    if (nextStatus === "CANCELLED" && !cancelledReason?.trim())
      throw new BusinessError("Vui lòng nhập lý do hủy đơn.", 422);
    const now = new Date();
    await tx.orders.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        ...(nextStatus === "CONFIRMED" ? { confirmed_at: now } : {}),
        ...(nextStatus === "SHIPPING" ? { shipping_at: now } : {}),
        ...(nextStatus === "COMPLETED"
          ? {
              completed_at: now,
              ...(order.payment_method === "COD"
                ? { payment_status: "PAID" as const }
                : {}),
            }
          : {}),
        ...(nextStatus === "CANCELLED"
          ? { cancelled_at: now, cancelled_reason: cancelledReason }
          : {}),
      },
    });
    if (nextStatus === "COMPLETED" && order.payment_method === "COD")
      await tx.payments.updateMany({
        where: { order_id: order.id, payment_method: "COD" },
        data: { status: "SUCCESS", paid_at: now },
      });
    if (nextStatus === "CANCELLED") {
      for (const item of order.order_items) {
        await tx.product_variants.update({
          where: { id: item.variant_id },
          data: { stock_quantity: { increment: item.quantity } },
        });
        await tx.products.update({
          where: { id: item.product_variants.product_id },
          data: { sold_count: { decrement: item.quantity } },
        });
      }
    }
    await tx.order_status_history.create({
      data: {
        order_id: order.id,
        old_status: order.status,
        new_status: nextStatus,
        changed_by: BigInt(adminId),
        note: note || (nextStatus === "CANCELLED" ? cancelledReason : null),
      },
    });
    return { id: orderId, status: nextStatus };
  });
}

export async function getAdminUsers() {
  const rows = await prisma.users.findMany({
    orderBy: { created_at: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  return rows.map((item) => ({
    id: item.id.toString(),
    name: item.full_name,
    email: item.email,
    phone: item.phone,
    role: item.role,
    status: item.status,
    orderCount: item._count.orders,
    createdAt: item.created_at.toISOString(),
  }));
}

export async function updateAdminUserStatus(
  adminId: string,
  userId: string,
  status: "ACTIVE" | "INACTIVE" | "BLOCKED",
) {
  if (adminId === userId && status !== "ACTIVE")
    throw new BusinessError(
      "Bạn không thể khóa hoặc vô hiệu hóa chính mình.",
      409,
    );
  const user = await prisma.users.update({
    where: { id: BigInt(userId) },
    data: { status },
    select: { id: true, status: true },
  });
  return { id: user.id.toString(), status: user.status };
}

export async function updateAdminUserAccess(
  adminId: string,
  userId: string,
  input: {
    status?: "ACTIVE" | "INACTIVE" | "BLOCKED";
    role?: "CUSTOMER" | "ADMIN";
  },
) {
  // Không cho tự hạ quyền và luôn giữ ít nhất một quản trị viên đang hoạt động.
  if (
    adminId === userId &&
    ((input.status && input.status !== "ACTIVE") || input.role === "CUSTOMER")
  )
    throw new BusinessError(
      "Bạn không thể tự hạ quyền hoặc khóa tài khoản của mình.",
      409,
    );
  const current = await prisma.users.findUnique({
    where: { id: BigInt(userId) },
    select: { role: true, status: true },
  });
  if (!current) throw new BusinessError("Không tìm thấy người dùng.", 404);
  if (
    current.role === "ADMIN" &&
    (input.role === "CUSTOMER" || (input.status && input.status !== "ACTIVE"))
  ) {
    const activeAdmins = await prisma.users.count({
      where: { role: "ADMIN", status: "ACTIVE" },
    });
    if (activeAdmins <= 1)
      throw new BusinessError(
        "Hệ thống phải còn ít nhất một quản trị viên hoạt động.",
        409,
      );
  }
  const user = await prisma.users.update({
    where: { id: BigInt(userId) },
    data: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.role ? { role: input.role } : {}),
    },
    select: { id: true, status: true, role: true },
  });
  return { id: user.id.toString(), status: user.status, role: user.role };
}

export async function getAdminCoupons() {
  const rows = await prisma.coupons.findMany({
    orderBy: { created_at: "desc" },
  });
  return rows.map((item) => ({
    id: item.id.toString(),
    code: item.code,
    name: item.name ?? "",
    discountType: item.discount_type,
    discountValue: Number(item.discount_value),
    minOrderValue: Number(item.min_order_value),
    maxDiscount: item.max_discount ? Number(item.max_discount) : null,
    usageLimit: item.usage_limit,
    usedCount: item.used_count,
    startDate: item.start_date?.toISOString() ?? null,
    endDate: item.end_date?.toISOString() ?? null,
    status: item.status,
  }));
}

type CouponInput = {
  code: string;
  name?: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status: boolean;
};
export async function saveAdminCoupon(id: string | null, input: CouponInput) {
  const data = {
    code: input.code,
    name: input.name || null,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_order_value: input.minOrderValue,
    max_discount: input.maxDiscount ?? null,
    usage_limit: input.usageLimit ?? null,
    start_date: input.startDate ? new Date(input.startDate) : null,
    end_date: input.endDate ? new Date(input.endDate) : null,
    status: input.status,
  };
  const result = id
    ? await prisma.coupons.update({ where: { id: BigInt(id) }, data })
    : await prisma.coupons.create({ data });
  return { id: result.id.toString() };
}
export async function deleteAdminCoupon(id: string) {
  const coupon = await prisma.coupons.findUnique({
    where: { id: BigInt(id) },
    include: { _count: { select: { orders: true, coupon_usages: true } } },
  });
  if (!coupon) throw new BusinessError("Không tìm thấy coupon.", 404);
  if (coupon._count.orders || coupon._count.coupon_usages) {
    await prisma.coupons.update({
      where: { id: coupon.id },
      data: { status: false },
    });
  } else {
    await prisma.coupons.delete({ where: { id: coupon.id } });
  }
  return { id };
}

export async function getAdminReviews() {
  const rows = await prisma.reviews.findMany({
    orderBy: { created_at: "desc" },
    include: {
      users: { select: { full_name: true, email: true } },
      products: { select: { name: true, slug: true } },
    },
  });
  return rows.map((item) => ({
    id: item.id.toString(),
    user: item.users.full_name,
    email: item.users.email,
    product: item.products.name,
    productSlug: item.products.slug,
    rating: item.rating,
    title: item.title,
    comment: item.comment,
    status: item.status,
    createdAt: item.created_at.toISOString(),
  }));
}
export async function updateAdminReview(
  id: string,
  status: "APPROVED" | "REJECTED",
) {
  const review = await prisma.reviews.update({
    where: { id: BigInt(id) },
    data: { status },
    select: { id: true, status: true },
  });
  return { id: review.id.toString(), status: review.status };
}
