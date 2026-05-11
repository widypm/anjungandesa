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
        label: wordingTr(userToken?.langCode, "reference"),
        key: "reference",
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
        label: wordingTr(userToken?.langCode, "description"),
        key: "description",
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
        label: "Balance",
        key: "totalDebit",
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
        label: "Status",
        key: "status",
        type: "text",
        sort: true,
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
      prisma.journalEntry.findMany({
        where: {
          isDeleted: false,
          companyId: userToken?.companyId,
          source: "JOURNALENTRY",
          ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
        },
        select: {
          id: true,
          isActive: true,
          createdAt: true,
          reference: true,
          description: true,
          statusJournal: true,
          lines: {
            select: {
              debit: true,
              credit: true,
            },
          },
        },
        orderBy: orderBy,
        skip,
        take: limit,
      }),
      prisma.journalEntry.count({
        where: {
          isDeleted: false,
          companyId: userToken?.companyId,
          source: "JOURNALENTRY",
          ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
        },
      }),
    ]);

    // Ubah ke format simpel
    const flatMenus = menus.map((m) => {
      const totalDebit = m.lines.reduce((sum, l) => sum + Number(l.debit), 0);
      const totalCredit = m.lines.reduce((sum, l) => sum + Number(l.credit), 0);

      return {
        id: m.id.toString(),
        reference: m.reference || "-",
        description: m.description || "-",
        isActive: m.isActive,
        createdAt: formatDateTimeIndo(m.createdAt),
        totalDebit: formatPrice(totalDebit),
        totalCredit,
        status: m.statusJournal,
        noEdit: m.statusJournal == "POSTED" && true,
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
      title: "Data Journal",
      header: columns,
      body: flatMenus,
      total: total,
      initTable: {
        buttonAdd: true,
        searchTable: true,
        editTable: false,
        permission: getPermission(userToken?.permission, "journal"),
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
