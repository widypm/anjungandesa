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
  formatPrice,
  getPermission,
} from "../../../../lib/helper";
import { verifyAndParseToken } from "../../../../lib/jwtParse";
import { wordingTr } from "app/lib/translationWording";
import { FaAudioDescription } from "react-icons/fa";
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
        label: wordingTr(userToken?.langCode, "name"),
        key: "name",
        type: "text",
        sort: true,
        typeForm: "text",
      },
      {
        label: wordingTr(userToken?.langCode, "account_debit"),
        key: "debitAccountId",
        type: "text",
        sort: true,
        typeForm: "select-single",
        uriSelect: "api/accounting/coa/master",
        join: true,
        joinSearch: {
          debitAccount: {
            name: "value",
          },
        },
      },
      {
        label: wordingTr(userToken?.langCode, "account_credit"),
        key: "creditAccountId",
        type: "text",
        sort: true,
        typeForm: "select-single",
        uriSelect: "api/accounting/coa/master",
        join: true,
        joinSearch: {
          debitAccount: {
            name: "value",
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
      if (sortBy == "roleName") {
        orderBy = { role: { name: order } };
      } else {
        orderBy = { [sortBy]: order };
      }
    }

    const whereConditions = buildSearchFilter(searchParams, columns);

    const [menus, total] = await prisma.$transaction([
      prisma.typeTransaction.findMany({
        where: {
          isDeleted: false,
          companyId: userToken?.companyId,
          ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
        },
        select: {
          id: true,
          isActive: true,
          createdAt: true,
          name: true,
          debitAccount: true,
          creditAccount: true,
        },
        orderBy: orderBy,
        skip,
        take: limit,
      }),
      prisma.journalEntry.count({
        where: {
          isDeleted: false,
          companyId: userToken?.companyId,
          ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
        },
      }),
    ]);

    // Ubah ke format simpel
    const flatMenus = menus.map((m) => {
      return {
        id: m.id.toString(),
        name: m.name || "-",
        debitAccountId: m.debitAccount?.name
          ? { value: m.debitAccount?.id, label: m.debitAccount?.name }
          : {},
        creditAccountId: m.creditAccount?.name
          ? { value: m.creditAccount?.id, label: m.creditAccount?.name }
          : {},
        isActive: m.isActive,
        createdAt: formatDateTimeIndo(m.createdAt),
      };
    });
    // Buat map id → node
    const menuMap = new Map<string, any>();
    flatMenus.forEach((m) => menuMap.set(m.id, m));

    // Susun tree dinamis

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
      title: "Data Type Transaction",
      header: columns,
      body: flatMenus,
      total: total,
      initTable: {
        buttonAdd: true,
        searchTable: true,
        editTable: true,
        permission: getPermission(userToken?.permission, "typetransaction"),
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
