import { prisma } from "@/lib/prisma";
export type BannerInput = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  sortOrder: number;
  startDate?: string | null;
  endDate?: string | null;
  status: boolean;
};
export async function getActiveBanners() {
  const now = new Date();
  const rows = await prisma.banners.findMany({
    where: {
      status: true,
      AND: [
        { OR: [{ start_date: null }, { start_date: { lte: now } }] },
        { OR: [{ end_date: null }, { end_date: { gte: now } }] },
      ],
    },
    orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
  });
  return rows.map((item) => ({
    id: item.id.toString(),
    title: item.title,
    subtitle: item.subtitle,
    image: item.image_url,
    href: item.link_url || "/products",
    buttonText: item.button_text || "Xem ngay",
  }));
}
export async function getAdminBanners() {
  const rows = await prisma.banners.findMany({
    orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
  });
  return rows.map((item) => ({
    id: item.id.toString(),
    title: item.title,
    subtitle: item.subtitle,
    imageUrl: item.image_url,
    linkUrl: item.link_url,
    buttonText: item.button_text,
    sortOrder: item.sort_order,
    startDate: item.start_date?.toISOString() ?? null,
    endDate: item.end_date?.toISOString() ?? null,
    status: item.status,
  }));
}
export async function saveBanner(id: string | null, input: BannerInput) {
  const data = {
    title: input.title,
    subtitle: input.subtitle || null,
    image_url: input.imageUrl,
    link_url: input.linkUrl || null,
    button_text: input.buttonText || null,
    sort_order: input.sortOrder,
    start_date: input.startDate ? new Date(input.startDate) : null,
    end_date: input.endDate ? new Date(input.endDate) : null,
    status: input.status,
  };
  const banner = id
    ? await prisma.banners.update({ where: { id: BigInt(id) }, data })
    : await prisma.banners.create({ data });
  return {
    id: banner.id.toString(),
    title: banner.title,
    subtitle: banner.subtitle,
    imageUrl: banner.image_url,
    linkUrl: banner.link_url,
    buttonText: banner.button_text,
    sortOrder: banner.sort_order,
    startDate: banner.start_date?.toISOString() ?? null,
    endDate: banner.end_date?.toISOString() ?? null,
    status: banner.status,
  };
}
export async function deleteBanner(id: string) {
  await prisma.banners.delete({ where: { id: BigInt(id) } });
  return { deleted: true };
}
