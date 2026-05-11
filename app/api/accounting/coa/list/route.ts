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
import { wordingTr } from "app/lib/translationWording";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "createdAt"; // default sorting
    const order = searchParams.get("order") === "asc" ? "asc" : "desc"; // default desc
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const isDownload = searchParams.get("isdownload"); // pdf / xls
    const skip = (page - 1) * limit;
    const userToken = await verifyAndParseToken(req);
    // colom
    const columns: HeaderTable[] = [
      {
        label: wordingTr(userToken?.langCode, "code"),
        key: "code",
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
        label: wordingTr(userToken?.langCode, "name"),
        key: "name",
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
        label: wordingTr(userToken?.langCode, "cash_flow_category"),
        key: "cashFlowCategory",
        type: "text",
        sort: false,
        typeForm: "hide",
      },
      {
        label: wordingTr(userToken?.langCode, "account_type"),
        key: "type",
        type: "text",
        sort: false,
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
    const allowedSort = Object.fromEntries(
      columns.filter((col) => col.sort).map((col) => [col.key, true])
    );
    // Sort object untuk Prisma
    let orderBy: any = { createdAt: "desc" };
    if (allowedSort[sortBy]) {
      if (sortBy == "roleName") {
        orderBy = { role: { name: order } };
      } else {
        orderBy = { [sortBy]: order };
      }
    }

    const whereConditions = buildSearchFilter(searchParams, columns);
    const menus = await prisma.account.findMany({
      where: {
        isDeleted: false,
        companyId: userToken?.companyId,
        ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
      },
      select: {
        id: true,
        parentId: true,
        isActive: true,
        createdAt: true,
        cashFlowCategory: true,
        code: true,
        name: true,
        type: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Ubah ke format simpel
    const flatMenus = menus.map((m) => ({
      id: m.id.toString(),
      parentId: m.parentId?.toString() ?? null,
      code: m.code || "-",
      name: m.name || "-",
      isActive: m.isActive,
      type: m.type,
      createdAt: formatDateTimeIndo(m.createdAt),
      children: [],
      cashFlowCategory: m.cashFlowCategory,
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
      return await handleExportXLS(flatMenus, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(flatMenus, columns);
    }
    //default json text

    const respon = ResponseHttp(200, "Success ", {
      title: "Data Menu",
      header: columns,
      body: tree,
      total: "-",
      initTable: {
        buttonAdd: true,
        searchTable: true,
        editTable: false,
        permission: getPermission(userToken?.permission, "coa"),
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
