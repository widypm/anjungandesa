// app/api/table/data/route.ts
import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { buildSearchFilter } from "../../../../lib/buildSearchFilter";
import { handleExportXLS } from "../../../../lib/exportXls";
import { handleExportPDF } from "../../../../lib/exportPdf";
import { HeaderTable } from "../../../../types";
import {
  formatDateTimeIndo,
  getPermission,
  renderHtmlLinks,
} from "../../../../lib/helper";
import { verifyAndParseToken } from "../../../../lib/jwtParse";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "order"; // default sorting
    const order = searchParams.get("order") === "asc" ? "asc" : "desc"; // default desc
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const isDownload = searchParams.get("isdownload"); // pdf / xls
    const skip = (page - 1) * limit;
    // colom
    const columns: HeaderTable[] = [
      {
        label: "Title",
        key: "title",
        type: "text",
        sort: false,
        typeForm: "text",
        join: true,
        joinSearch: {
          translations: {
            some: {
              title: {
                contains: "value",
              },
              isDeleted: false,
            },
          },
        },
      },
      {
        label: "Direct Url",
        key: "slug",
        type: "text",
        sort: false,
        typeForm: "text",
        join: true,
        joinSearch: {
          translations: {
            some: {
              slug: {
                contains: "value",
              },
              isDeleted: false,
            },
          },
        },
      },
      {
        label: "Page",
        key: "pageName",
        type: "html",
        sort: false,
        typeForm: "text",
        join: true,
        joinSearch: {
          translations: {
            some: {
              page: {
                translations: {
                  some: {
                    title: { contains: "value" },
                  },
                },
              },
            },
          },
        },
      },

      {
        label: "Created At",
        key: "createdAt",
        type: "text",
        sort: false,
        typeForm: "hide",
      },
      {
        label: "Active",
        key: "isActive",
        type: "boolean",
        sort: false,
        typeForm: "switch",
      },
    ];
    const allowedSort = Object.fromEntries(
      columns.filter((col) => col.sort).map((col) => [col.key, true])
    );
    // Sort object untuk Prisma
    let orderBy: any = { order: "asc" };
    if (allowedSort[sortBy]) {
      if (sortBy == "roleName") {
        orderBy = { role: { name: order } };
      } else {
        orderBy = { [sortBy]: order };
      }
    }
    const userToken: any = await verifyAndParseToken(req);
    const whereConditions = buildSearchFilter(searchParams, columns);
    const menus = await prisma.menu.findMany({
      where: {
        isDeleted: false,
        typeMenuId: { not: 1 },
        companyId: userToken?.companyId,
        ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
      },
      select: {
        id: true,
        parentId: true,
        isActive: true,
        createdAt: true,
        translations: {
          where: {
            langCode: "ID",
            isDeleted: false,
          },
          select: {
            title: true,
            slug: true,
            pageId: true,
            categoryId: true,
            page: {
              include: {
                translations: {
                  where: { langCode: "ID", isDeleted: false },
                  select: { title: true, id: true, pageId: true },
                  take: 1,
                },
              },
            },
            category: {
              include: {
                pageTranslations: {
                  where: { langCode: "ID", isDeleted: false },
                  select: {
                    title: true,
                    id: true,
                    pageId: true,
                    categoryId: true,
                  },
                  take: 1,
                },
              },
            },
          },
          take: 1,
        },
      },
      orderBy: orderBy ?? { order: "asc" },
    });

    // Ubah ke format simpel
    const flatMenus = menus.map((m) => ({
      id: m.id.toString(),
      parentId: m.parentId?.toString() ?? null,
      title: m.translations?.[0]?.title || "-",
      slug: !m.translations?.[0]?.pageId
        ? m.translations?.[0]?.slug || "-"
        : "-",

      pageName: m.translations?.[0]?.page?.translations?.[0]?.title
        ? renderHtmlLinks({
            withNumber: false,
            urlNumber: "#",
            formUrl: `/cms/module/page/cms/form?id=`,
            id: m.translations?.[0]?.page?.translations?.[0]?.pageId,
            addNewPostLabel:
              m.translations?.[0]?.page?.translations?.[0]?.title,
            lengthLabel: 0,
          })
        : "-",
      isActive: m.isActive,
      createdAt: formatDateTimeIndo(m.createdAt),
      children: [],
    }));

    // Buat map id → node
    const menuMap = new Map<string, any>();
    flatMenus.forEach((m) => menuMap.set(m.id, m));

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
    // Handle XLS Export
    if (isDownload === "xls") {
      return await handleExportXLS(tree, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(tree, columns);
    }
    //default json text

    const respon = ResponseHttp(200, "Success ", {
      title: "Data Menu",
      header: columns,
      body: tree,
      total: "-",
      initTable: {
        buttonAdd: true,
        buttonCopy: true,
        searchTable: true,
        editTable: false,
        isDrag: true,
        permission: getPermission(userToken?.permission, "menu"),
      },
    });
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    const rsp = ResponseHttp(500, "Application Maintenace");
    const response = new NextResponse(rsp, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
