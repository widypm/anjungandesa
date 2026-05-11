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
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "createdAt"; // default sorting
    const order = searchParams.get("order") === "asc" ? "asc" : "desc"; // default desc
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const isDownload = searchParams.get("isdownload"); // pdf / xls
    const skip = (page - 1) * limit;
    // colom
    const columns: HeaderTable[] = [
      {
        label: "Key",
        key: "key",
        type: "text",
        sort: true,
        typeForm: "text",
      },
      {
        label: "Value",
        key: "value",
        type: "text",
        sort: true,
        typeForm: "text",
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
    const where: Prisma.SettingAppWhereInput = {
      isDeleted: false,
      ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
    };

    const [dataq, total] = await Promise.all([
      prisma.settingApp.findMany({
        where,
        select: {
          id: true,
          value: true,
          key: true,
          createdAt: true,
          isActive: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.settingApp.count({ where }),
    ]);
    // Transform data
    const formatted = dataq.map((u) => ({
      id: u.id.toString(),
      value: u.value,
      key: u.key,
      createdAt: formatDateTimeIndo(u.createdAt),
      isActive: u.isActive,
    }));
    // Handle XLS Export
    if (isDownload === "xls") {
      return await handleExportXLS(formatted, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(formatted, columns);
    }
    //default json text
    const userToken: any = await verifyAndParseToken(req);
    const respon = ResponseHttp(200, "Success Login", {
      title: "Data Setting Web/App",
      header: columns,
      body: formatted,
      total: total,
      initTable: {
        buttonAdd: true,
        searchTable: true,
        editTable: true,
        permission: getPermission(userToken?.permission, "setting"),
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
