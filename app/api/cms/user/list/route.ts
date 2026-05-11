// app/api/table/data/route.ts
import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { buildSearchFilter } from "../../../../lib/buildSearchFilter";
import { handleExportXLS } from "../../../../lib/exportXls";
import { handleExportPDF } from "../../../../lib/exportPdf";
import { HeaderTable } from "../../../../types";
import { Prisma } from "@prisma/client";
import { getPermission } from "app/lib/helper";
import { verifyAndParseToken } from "app/lib/jwtParse";
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
        label: "Name",
        key: "name",
        type: "text",
        sort: true,
        typeForm: "text",
      },
      {
        label: "Email",
        key: "email",
        type: "text",
        sort: true,
        typeForm: "email",
      },
      {
        label: "Role",
        key: "roleName",
        type: "text",
        sort: true,
        typeForm: "select-single",
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
    const userToken: any = await verifyAndParseToken(req);
    const whereConditions = buildSearchFilter(searchParams, columns);
    const where: Prisma.UserWhereInput = {
      isDeleted: false,
      companyId: userToken?.companyId,
      ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
    };

    const [dataq, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          isActive: true,
          role: {
            select: {
              name: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    // Transform data
    const formatted = dataq.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      createdAt: u.createdAt.toISOString().split("T")[0],
      isActive: u.isActive,
      roleName: u.role?.name ?? "-",
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

    const respon = ResponseHttp(200, "Success Login", {
      title: "Data User",
      header: columns,
      body: formatted,
      total: formatted.length ?? 0,
      initTable: {
        buttonAdd: true,
        searchTable: true,
        editTable: false,
        permission: getPermission(userToken?.permission, "user"),
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
