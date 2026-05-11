import { prisma } from "../../lib/prisma";
import NodeCache from "node-cache";
import { formatDateTimeIndo } from "../helper";

const myCache = new NodeCache({
  stdTTL: Number(process.env.NEXT_PUBLIC_CHACE_TIME),
}); //def 5min

export async function getCachedMenuForlog(id: number) {
  try {
    const key = `menuForlog-${id}`;
    const cached = myCache.get(key);
    if (cached) return cached;
    const menus = await prisma.menu.findMany({
      where: { typeMenuId: 1 },
      orderBy: [{ parentId: "asc" }, { sort: "asc" }],
      include: {
        translations: true, // Include relasi media
      },
    });

    myCache.set(key, menus);
    return menus;
  } catch (error) {
    console.log("error chace menu", error);
  }
}
export async function getCachedMenuForFE(langCode: string, companyId: string) {
  try {
    const key = `menuForFEnew-${langCode}-${companyId}`;
    const cached = myCache.get(key);
    // console.log("menuchace", cached);
    if (cached) return cached;
    const menus = await prisma.menu.findMany({
      where: {
        isDeleted: false,
        typeMenuId: { not: 1 },
        companyId: companyId,
        isActive: true,
      },
      select: {
        id: true,
        parentId: true,
        isActive: true,
        createdAt: true,
        typeMenu: true,

        translations: {
          where: {
            langCode: langCode,
            isDeleted: false,
          },
          select: {
            title: true,
            slug: true,
            subTitle: true,
            overview: true,
            description: true,
            linkType: true,
            page: {
              include: {
                translations: { where: { langCode: langCode.toUpperCase() } },
              },
            },
            category: {
              include: {
                pageTranslations: {
                  where: { langCode: langCode.toUpperCase() },
                },
              },
            },
          },
          take: 1,
        },
        medias: {
          where: {
            langCode: langCode,
            isDeleted: false,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Ubah ke format simpel
    const flatMenus = menus.map((m) => ({
      id: m.id.toString(),
      parentId: m.parentId?.toString() ?? null,
      title: m.translations?.[0]?.title || "",
      subTitle: m.translations?.[0]?.subTitle || "",
      overview: m.translations?.[0]?.overview || "",
      description: m.translations?.[0]?.description || "",
      url:
        m.translations?.[0]?.linkType == "URL"
          ? "/" + m.translations?.[0]?.slug || "/"
          : m.translations?.[0]?.linkType == "PAGE"
          ? "/" + m.translations?.[0]?.page?.translations?.[0]?.slug || "/"
          : m.translations?.[0]?.linkType == "CATEGORY"
          ? "/" + m.translations?.[0]?.category?.pageTranslations?.[0]?.slug ||
            "/"
          : "/" + m.translations?.[0]?.slug || "/",
      medias: m.medias,
      isActive: m.isActive,
      createdAt: formatDateTimeIndo(m.createdAt),
      children: [],
    }));

    // Buat map id → node
    const menuMap = new Map<string, any>();
    flatMenus.forEach((m) => menuMap.set(m.id, m));
    // console.log("menus" + flatMenus);
    // Susun tree dinamis
    const tree: any[] = [];
    flatMenus.forEach((m) => {
      if (m.parentId && menuMap.has(m.parentId)) {
        const parent = menuMap.get(m.parentId);
        parent.children.push(m);
      } else {
        tree.push(m); // root node
      }
    });
    myCache.set(key, tree);
    return tree;
  } catch (error) {
    console.log("error chace menu", error);
  }
}
function hasPermission(menuId: number, permission: any[]): boolean {
  return permission.some((p) => p.menu.id === menuId && p.view === true);
}
export async function getCachedMenuForBE(
  langCode: string,
  companyId: string,
  permission?: any
) {
  try {
    // console.log("bahasa", langCode);
    const key = `menuForBEnew-${langCode}-${companyId}`;
    const cached = myCache.get(key);
    // console.log("menuchace", cached);
    if (cached) return cached;
    const menus = await prisma.menu.findMany({
      where: {
        isDeleted: false,
        typeMenuId: 1,
        companyId: companyId,
      },
      select: {
        id: true,
        parentId: true,
        isActive: true,
        createdAt: true,
        translations: {
          where: {
            langCode: langCode,
            isDeleted: false,
          },
          select: { title: true, slug: true },
          take: 1,
        },
        medias: {
          where: {
            langCode: "ID",
            isDeleted: false,
            type: "media_icon",
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Ubah ke format simpel
    const flatMenus = menus
      .filter((m) => hasPermission(m.id, permission))
      .map((m) => ({
        id: m.id.toString(),
        parentId: m.parentId?.toString() ?? null,
        title: m.translations?.[0]?.title || "-",
        slug: m.translations?.[0]?.slug || "-",
        icon: m.medias?.[0]?.url || "-",
        isActive: m.isActive,
        createdAt: formatDateTimeIndo(m.createdAt),
        children: [],
      }));

    // Buat map id → node
    const menuMap = new Map<string, any>();
    flatMenus.forEach((m) => menuMap.set(m.id, m));
    // console.log("menus" + flatMenus);
    // Susun tree dinamis
    const tree: any[] = [];
    flatMenus.forEach((m) => {
      if (m.parentId && menuMap.has(m.parentId)) {
        const parent = menuMap.get(m.parentId);
        parent.children.push(m);
      } else {
        tree.push(m); // root node
      }
    });
    ///extra menu added
    const menusFe = await prisma.menu.findMany({
      where: {
        isDeleted: false,
        typeMenuId: { not: 1 },
        companyId: companyId,
      },
      select: {
        id: true,
        parentId: true,
        isActive: true,
        createdAt: true,
        translations: {
          where: {
            langCode: langCode,
            isDeleted: false,
          },
          select: {
            title: true,
            slug: true,
            page: { include: { translations: true } },
          },
          take: 1,
        },
        medias: {
          where: {
            langCode: "ID",
            isDeleted: false,
            type: "media_icon",
          },
        },
      },
      orderBy: { order: "asc" },
    });

    // Ubah ke format simpel
    const flatMenusFe = menusFe.map((m) => ({
      id: m.id.toString(),
      parentId: m.parentId?.toString() ?? null,
      title: m.translations?.[0]?.title || "-",
      slug: m.translations?.[0]?.page?.translations?.[0]?.title
        ? `/cms/module/page/cms/form?id=${m.translations?.[0]?.page?.translations?.[0]?.pageId}`
        : `#`,
      icon: "/images/content.png",
      isActive: m.isActive,
      createdAt: formatDateTimeIndo(m.createdAt),
      isFe: true,
      children: [],
    }));

    // Buat map id → node
    const menuMapFe = new Map<string, any>();
    flatMenusFe.forEach((m) => menuMapFe.set(m.id, m));

    // Susun tree dinamis
    const treeFe: any[] = [];
    flatMenusFe.forEach((m) => {
      if (m.parentId && menuMapFe.has(m.parentId)) {
        const parent = menuMapFe.get(m.parentId);
        parent.children.push(m);
      } else {
        treeFe.push(m); // root node
      }
    });
    function appendExtraMenu(tree: any[]) {
      tree.forEach((node) => {
        if (node.title === "CMS") {
          node.children = [...treeFe, ...node.children];
        }
        if (node.children?.length) {
          appendExtraMenu(node.children);
        }
      });

      return tree; // ✅ return biar bisa ditampung ke treefinal
    }
    const treefinal = appendExtraMenu(tree);
    myCache.set(key, treefinal);
    return tree;
  } catch (error) {
    console.log("error chace menu", error);
  }
}
