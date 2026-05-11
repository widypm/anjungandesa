// app/api/table/data/route.ts
import { prisma } from "../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../lib/response";
import { buildSearchFilter } from "../../../lib/buildSearchFilter";
import { handleExportXLS } from "../../../lib/exportXls";
import { handleExportPDF } from "../../../lib/exportPdf";
import { HeaderTable } from "../../../types";
import { formatDateTimeIndo } from "../../../lib/helper";
import { verifyAndParseToken } from "app/lib/jwtParse";
import { getCachedMenuForBE } from "app/lib/controller/menu";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isDownload = searchParams.get("isdownload"); // pdf / xls

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
        sort: true,
        typeForm: "switch",
      },
    ];

    const userToken: any = await verifyAndParseToken(req);

    const flatMenus: any = await getCachedMenuForBE(
      userToken?.langCode,
      userToken?.companyId,
      userToken?.permission
    );

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
      title: "Data Role",
      header: columns,
      body: tree,
      initTable: {
        buttonAdd: true,
        searchTable: true,
        editTable: false,
      },
    });
    const response = new NextResponse(await respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    const rsp = ResponseHttp(500, "Application Maintenace");
    const response = new NextResponse(await rsp, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
