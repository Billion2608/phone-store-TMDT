import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  ProductCardData,
  ProductDetailData,
  ProductQuery,
  ProductSort,
} from "@/types/product";

const activeVariantWhere = { status: true } as const;

const cardSelect = {
  id: true,
  name: true,
  slug: true,
  thumbnail: true,
  sold_count: true,
  brands: { select: { name: true } },
  categories: { select: { name: true } },
  product_variants: {
    where: activeVariantWhere,
    orderBy: [{ sale_price: "asc" }, { price: "asc" }],
    select: { price: true, sale_price: true, stock_quantity: true },
  },
  reviews: {
    where: { status: "APPROVED" as const },
    select: { rating: true },
  },
} satisfies Prisma.productsSelect;

function mapCard(product: {
  id: bigint;
  name: string;
  slug: string;
  thumbnail: string | null;
  sold_count: bigint;
  brands: { name: string } | null;
  categories: { name: string };
  product_variants: Array<{
    price: Prisma.Decimal;
    sale_price: Prisma.Decimal | null;
    stock_quantity: number;
  }>;
  reviews: Array<{ rating: number }>;
}): ProductCardData {
  const variants = product.product_variants;
  const cheapest = [...variants].sort((a, b) => {
    const aPrice = Number(a.sale_price ?? a.price);
    const bPrice = Number(b.sale_price ?? b.price);
    return aPrice - bPrice;
  })[0];
  const rating = product.reviews.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
      product.reviews.length
    : 0;

  return {
    id: product.id.toString(),
    name: product.name,
    slug: product.slug,
    thumbnail: product.thumbnail,
    brand: product.brands?.name ?? null,
    category: product.categories.name,
    price: cheapest ? Number(cheapest.price) : 0,
    salePrice: cheapest?.sale_price ? Number(cheapest.sale_price) : null,
    rating: Math.round(rating * 10) / 10,
    reviewCount: product.reviews.length,
    soldCount: Number(product.sold_count),
    stock: variants.reduce((sum, variant) => sum + variant.stock_quantity, 0),
  };
}

function priceCondition(minPrice?: number, maxPrice?: number) {
  if (minPrice === undefined && maxPrice === undefined) return undefined;
  const range = {
    ...(minPrice !== undefined ? { gte: minPrice } : {}),
    ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
  };

  return {
    some: {
      status: true,
      OR: [
        { sale_price: { not: null, ...range } },
        { sale_price: null, price: range },
      ],
    },
  };
}

function productWhere(query: ProductQuery) {
  return {
    status: "ACTIVE" as const,
    ...(query.search ? { name: { contains: query.search.trim() } } : {}),
    ...(query.category
      ? {
          categories: {
            is: {
              slug: query.category,
            },
          },
        }
      : {}),
    ...(query.brand ? { brands: { is: { slug: query.brand } } } : {}),
    ...(priceCondition(query.minPrice, query.maxPrice)
      ? { product_variants: priceCondition(query.minPrice, query.maxPrice) }
      : { product_variants: { some: { status: true } } }),
  };
}

function getOrderBy(sort: ProductSort = "newest") {
  if (sort === "best-selling")
    return [{ sold_count: "desc" as const }, { created_at: "desc" as const }];
  return [{ created_at: "desc" as const }];
}

export async function getProducts(query: ProductQuery = {}) {
  const limit = Math.min(Math.max(query.limit ?? 12, 1), 48);
  const requestedPage = Math.max(query.page ?? 1, 1);
  const where = productWhere(query);
  const total = await prisma.products.count({ where });
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const page = Math.min(requestedPage, totalPages);

  let products;
  if (query.sort === "price-asc" || query.sort === "price-desc") {
    const conditions: Prisma.Sql[] = [
      Prisma.sql`p.status = 'ACTIVE'`,
      Prisma.sql`v.status = true`,
    ];
    if (query.search)
      conditions.push(Prisma.sql`p.name LIKE ${`%${query.search.trim()}%`}`);
    if (query.category)
      conditions.push(Prisma.sql`c.slug = ${query.category}`);
    if (query.brand) conditions.push(Prisma.sql`b.slug = ${query.brand}`);
    if (query.minPrice !== undefined)
      conditions.push(
        Prisma.sql`COALESCE(v.sale_price, v.price) >= ${query.minPrice}`,
      );
    if (query.maxPrice !== undefined)
      conditions.push(
        Prisma.sql`COALESCE(v.sale_price, v.price) <= ${query.maxPrice}`,
      );
    const direction =
      query.sort === "price-asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
    const rows = await prisma.$queryRaw<Array<{ id: bigint }>>(Prisma.sql`
      SELECT p.id
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN brands b ON b.id = p.brand_id
      JOIN product_variants v ON v.product_id = p.id
      WHERE ${Prisma.join(conditions, " AND ")}
      GROUP BY p.id
      ORDER BY MIN(COALESCE(v.sale_price, v.price)) ${direction}, p.created_at DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `);
    const orderedIds = rows.map((row) => row.id);
    const unordered = await prisma.products.findMany({
      where: { id: { in: orderedIds } },
      select: cardSelect,
    });
    const positions = new Map(
      orderedIds.map((id, index) => [id.toString(), index]),
    );
    products = unordered.sort(
      (a, b) =>
        (positions.get(a.id.toString()) ?? 0) -
        (positions.get(b.id.toString()) ?? 0),
    );
  } else {
    products = await prisma.products.findMany({
      where,
      select: cardSelect,
      orderBy: getOrderBy(query.sort),
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  const items = products.map(mapCard);

  return { items, pagination: { page, limit, total, totalPages } };
}

export async function getFeaturedProducts(limit = 8) {
  const products = await prisma.products.findMany({
    where: {
      status: "ACTIVE",
      featured: true,
      product_variants: { some: activeVariantWhere },
    },
    select: cardSelect,
    orderBy: { created_at: "desc" },
    take: limit,
  });
  return products.map(mapCard);
}

export async function getProductsByCategoryRoot(rootSlug: string, limit = 8) {
  const products = await prisma.products.findMany({
    where: {
      status: "ACTIVE",
      product_variants: { some: activeVariantWhere },
      categories: {
        is: {
          slug: rootSlug,
        },
      },
    },
    select: cardSelect,
    orderBy: [{ sold_count: "desc" }, { created_at: "desc" }],
    take: limit,
  });
  return products.map(mapCard);
}

export async function getFilterOptions() {
  const [categories, brands] = await Promise.all([
    prisma.categories.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.brands.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { categories, brands };
}

export async function getHomeCategories() {
  const categories = await prisma.categories.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
    },
    orderBy: { name: "asc" },
    take: 12,
  });

  return categories.map((cat) => ({
    ...cat,
    id: Number(cat.id),
  }));
}

export async function getActiveBrands(limit = 10) {
  return prisma.brands.findMany({
    select: { name: true, slug: true, logo: true },
    orderBy: { name: "asc" },
    take: limit,
  });
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetailData | null> {
  const product = await prisma.products.findFirst({
    where: { slug, status: "ACTIVE" },
    select: {
      ...cardSelect,
      short_description: true,
      description: true,
      product_images: {
        orderBy: { sort_order: "asc" },
        select: { image_url: true },
      },
      product_specifications: {
        orderBy: { sort_order: "asc" },
        select: { spec_name: true, spec_value: true },
      },
      product_variants: {
        where: { status: true },
        orderBy: { price: "asc" },
        select: {
          id: true,
          sku: true,
          price: true,
          sale_price: true,
          stock_quantity: true,
          image: true,
          variant_attribute_values: {
            select: {
              attribute_values: {
                select: { value: true, attributes: { select: { name: true } } },
              },
            },
          },
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          rating: true,
          title: true,
          comment: true,
          created_at: true,
          users: { select: { full_name: true } },
          review_images: { select: { image_url: true } },
        },
      },
    },
  });
  if (!product) return null;

  const base = mapCard(product);
  return {
    ...base,
    shortDescription: product.short_description,
    description: product.description,
    images: Array.from(
      new Set(
        [
          product.thumbnail,
          ...product.product_images.map((image) => image.image_url),
        ].filter(Boolean) as string[],
      ),
    ),
    specifications: product.product_specifications.map((spec) => ({
      name: spec.spec_name,
      value: spec.spec_value,
    })),
    variants: product.product_variants.map((variant) => ({
      id: variant.id.toString(),
      sku: variant.sku,
      price: Number(variant.price),
      salePrice: variant.sale_price ? Number(variant.sale_price) : null,
      stock: variant.stock_quantity,
      image: variant.image,
      attributes: variant.variant_attribute_values.map((item) => ({
        name: item.attribute_values.attributes.name,
        value: item.attribute_values.value,
      })),
    })),
    reviews: product.reviews.map((review) => ({
      id: review.id.toString(),
      userName: review.users.full_name,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.created_at.toISOString(),
      images: review.review_images.map((image) => image.image_url),
    })),
  };
}

export async function getRelatedProducts(
  productId: string,
  category: string,
  limit = 4,
) {
  const products = await prisma.products.findMany({
    where: {
      id: { not: BigInt(productId) },
      status: "ACTIVE",
      categories: { is: { name: category } },
      product_variants: { some: activeVariantWhere },
    },
    select: cardSelect,
    take: limit,
    orderBy: { created_at: "desc" },
  });
  return products.map(mapCard);
}