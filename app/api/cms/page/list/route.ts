// app/api/table/data/route.ts
import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { buildSearchFilter } from "../../../../lib/buildSearchFilter";
import { handleExportXLS } from "../../../../lib/exportXls";
import { handleExportPDF } from "../../../../lib/exportPdf";
import { HeaderTable } from "../../../../types";
import { formatDateTimeIndo, getPermission } from "../../../../lib/helper";
import { verifyAndParseToken } from "../../../../lib/jwtParse";
import { Prisma } from "@prisma/client";
import { title } from "process";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "createdAt"; // default sorting
    const order = searchParams.get("order") === "asc" ? "asc" : "desc"; // default desc
    const isDownload = searchParams.get("isdownload"); // pdf / xls
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    // colom
    const columns: HeaderTable[] = [
      {
        label: "Title",
        key: "title",
        type: "text",
        sort: true,
        typeForm: "text",
        join: true,
        joinSearch: {
          page: {
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
      },
      {
        label: "Slug",
        key: "slug",
        type: "text",
        sort: true,
        typeForm: "text",
        join: true,
        joinSearch: {          
          page: {
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
    const allowedSort = Object.fromEntries(
      columns.filter((col) => col.sort).map((col) => [col.key, true])
    );
    // Sort object untuk Prisma
    let orderBy: any = { createdAt: "desc" };
    if (allowedSort[sortBy]) {
      if (sortBy == "ctitle") {
        orderBy = { translations: { title: order } };
      } else {
        orderBy = { [sortBy]: order };
      }
    }
    const userToken: any = await verifyAndParseToken(req);
    const whereConditions = buildSearchFilter(searchParams, columns);
    const where: Prisma.PageTranslationWhereInput = {
      isDeleted: false,
      langCode: "ID",
      pageId: { not: null },
      companyId: userToken?.companyId,
      page: {
        pageType: "PAGE",
      },
      ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
    };

    const [pages, total] = await prisma.$transaction([
      prisma.pageTranslation.findMany({
        where,
        include: {
          page: true,
        },
        orderBy: orderBy,
        skip,
        take: limit,
      }),
      prisma.pageTranslation.count({ where }),
    ]);

    // Ubah ke format simpel
    const flatMenus = pages.map((m) => ({
      id: m.page.id.toString(),
      title: m.title || "-",
      slug: m.slug || "-",
      isActive: m.isActive,
      createdAt: formatDateTimeIndo(m.page.createdAt),
      children: [],
    }));

    // Handle XLS Export
    if (isDownload === "xls") {
      return await handleExportXLS(flatMenus, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(flatMenus, columns);
    }
    //default json text

    const respon = ResponseHttp(200, "Success ", {
      title: "Data Page",
      header: columns,
      body: flatMenus,
      total: total,
      initTable: {
        buttonAdd: true,
        buttonCopy: true,
        searchTable: true,
        editTable: false,
        permission: getPermission(userToken?.permission, "page"),
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
