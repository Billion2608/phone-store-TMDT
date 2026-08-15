import { prisma } from "@/lib/prisma";

export type BannerInput = {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  sortOrder: number;
  status: boolean;
};

export async function getActiveBanners() {
  const rows = await prisma.banners.findMany({
    where: {
      active: true,
    },
    orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
  });

  return rows.map((item) => ({
    id: item.id.toString(),
    title: item.title,
    subtitle: "",
    image: item.image_url,
    href: item.link_url || "/products",
    buttonText: "Xem ngay",
  }));
}

export async function getAdminBanners() {
  const rows = await prisma.banners.findMany({
    orderBy: [{ sort_order: "asc" }, { created_at: "desc" }],
  });

  return rows.map((item) => ({
    id: item.id.toString(),
    title: item.title,
    subtitle: "",
    imageUrl: item.image_url,
    linkUrl: item.link_url,
    buttonText: "Xem ngay",
    sortOrder: item.sort_order,
    startDate: null,
    endDate: null,
    status: item.active,
  }));
}

export async function saveBanner(id: string | null, input: BannerInput) {
  const data = {
    title: input.title,
    image_url: input.imageUrl,
    link_url: input.linkUrl || null,
    sort_order: input.sortOrder,
    active: input.status,
  };

  const banner = id
    ? await prisma.banners.update({ where: { id: BigInt(id) }, data })
    : await prisma.banners.create({ data });

  return {
    id: banner.id.toString(),
    title: banner.title,
    subtitle: "",
    imageUrl: banner.image_url,
    linkUrl: banner.link_url,
    buttonText: "Xem ngay",
    sortOrder: banner.sort_order,
    startDate: null,
    endDate: null,
    status: banner.active,
  };
}

export async function deleteBanner(id: string) {
  await prisma.banners.delete({ where: { id: BigInt(id) } });
  return { deleted: true };
}
