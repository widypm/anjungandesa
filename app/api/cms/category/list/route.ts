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
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";

function getQueryOptions(searchParams: URLSearchParams) {
  return {
    sortBy: searchParams.get("sortBy") || "createdAt",
    catpost: Number(searchParams.get("catpost") || 0),
    order: searchParams.get("order") === "asc" ? "asc" : "desc",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "10", 10),
    isDownload: searchParams.get("isdownload"),
    skip:
      (parseInt(searchParams.get("page") || "1", 10) - 1) *
      parseInt(searchParams.get("limit") || "10", 10),
  };
}
function getColumns(type: any): HeaderTable[] {
  return type > 0
    ? [
        {
          label: "Title",
          key: "title",
          type: "text",
          sort: true,
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
          label: "Slug",
          key: "slug",
          type: "text",
          sort: true,
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
          label: "Created At",
          key: "createdAt",
          type: "text",
          sort: true,
          typeForm: "hide",
        },
        {
          label: "Active",
          key: "isActive",
          type: "boolean",
          sort: false,
          typeForm: "switch",
        },
      ]
    : [
        {
          label: "Name",
          key: "title",
          type: "text",
          sort: true,
          typeForm: "text",
          join: true,
          joinSearch: {
            PageTranslations: {
              some: {
                title: { contains: "value" },
                isDeleted: false,
              },
            },
          },
        },
        {
          label: "Slug",
          key: "slug",
          type: "text",
          sort: true,
          typeForm: "text",
          join: true,
          joinSearch: {
            PageTranslations: {
              some: {
                slug: { contains: "value" },
                isDeleted: false,
              },
            },
          },
        },
        {
          label: "Post",
          key: "postData",
          type: "html",
          sort: false,
          noSearch: true,
          typeForm: "hide",
        },
        {
          label: "Created At",
          key: "createdAt",
          type: "text",
          sort: true,
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
}
function getOrderBy(sortBy: string, order: string, columns: HeaderTable[]) {
  const allowedSort = Object.fromEntries(
    columns.filter((col) => col.sort).map((col) => [col.key, true])
  );

  if (allowedSort[sortBy]) {
    if (sortBy === "roleName") {
      return { role: { name: order } };
    }
    return { [sortBy]: order };
  }

  return { createdAt: "desc" }; // default
}
async function fetchPageData(
  whereConditions: any[],
  orderBy: any,
  skip: number,
  limit: number,
  type: number,
  userToken: any
) {
  if (type > 0) {
    const where: Prisma.PageTranslationWhereInput = {
      isDeleted: false,
      langCode: "ID",
      pageId: { not: null },
      companyId: userToken.companyId ?? null,
      page: {
        pageType: "POST",
        pageCategories: {
          some: {
            categoryId: type,
            langCode: "ID", // filter bahasa
          },
        },
      },

      ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.pageTranslation.findMany({
        where,
        select: {
          id: true,
          isActive: true,
          createdAt: true,
          title: true,
          slug: true,
          page: {
            select: {
              id: true,
              pageCategories: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.pageTranslation.count({ where }),
    ]);

    return { data, total };
  } else {
    const where: Prisma.PageTranslationWhereInput = {
      langCode: "ID",
      categoryId: { not: null },
      category: {
        isDeleted: false,
      },
      ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.pageTranslation.findMany({
        where,
        select: {
          id: true,
          isActive: true,
          createdAt: true,
          title: true,
          slug: true,
          category: {
            select: {
              id: true,
              isActive: true,
              createdAt: true,
              pageCategories: {
                where: { langCode: "ID" },
                distinct: ["categoryId", "pageId"],
                select: { categoryId: true },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.pageTranslation.count({ where }),
    ]);

    return { data, total };
  }
}
function formatToFlatMenus(pages: any[], type: number) {
  if (type > 0) {
    return pages.map((m) => ({
      id: m.page.id.toString(),

      title: m.title || "-",
      slug: m.slug || "-",
      isActive: m.page.isActive,
      createdAt: formatDateTimeIndo(m.page.createdAt),
      children: [],
    }));
  } else {
    return pages.map((m) => ({
      id: m.category.id,
      title: m.title || "-",
      slug: m.slug || "-",
      postData: renderHtmlLinks({
        withNumber: true,
        urlNumber: "/cms/module/category/cms/list?catpost=",
        formUrl: "/cms/module/category/cms/form?catpost=",
        id: m.category.id,
        addNewPostLabel: "Add New Post",
        lengthLabel: m.category.pageCategories.length,
      }),
      isActive: m.isActive,
      createdAt: formatDateTimeIndo(m.category.createdAt),
      children: [],
    }));
  }
}
export async function GET(req: Request) {
  try {
    const userToken: any = await verifyAndParseToken(req);
    const { searchParams } = new URL(req.url);
    const queryOptions = getQueryOptions(searchParams);
    const columns = getColumns(queryOptions.catpost);
    const orderBy = getOrderBy(
      queryOptions.sortBy,
      queryOptions.order,
      columns
    );
    const whereConditions = buildSearchFilter(searchParams, columns);

    const { data, total } = await fetchPageData(
      whereConditions,
      orderBy,
      queryOptions.skip,
      queryOptions.limit,
      queryOptions.catpost,
      userToken
    );
    const flatMenus = formatToFlatMenus(data, queryOptions.catpost);

    // Export handling
    if (queryOptions.isDownload === "xls")
      return await handleExportXLS(flatMenus, columns);
    if (queryOptions.isDownload === "pdf")
      return await handleExportPDF(flatMenus, columns);

    return new NextResponse(
      ResponseHttp(200, "Success", {
        title: "Data Page",
        header: columns,
        body: flatMenus,
        total: total,
        initTable: {
          buttonAdd: true,
          buttonCopy: true,
          searchTable: true,
          editTable: false,
          permission: getPermission(userToken?.permission, "category"),
        },
      }),
      { status: 200, headers: { "Content-Type": "text/plain" } }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      ResponseHttp(500, "Application Maintenance", {}, error),
      {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      }
    );
  }
}
