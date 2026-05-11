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
import { email } from "zod";
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
        label: "phone",
        key: "phone",
        type: "text",
        sort: true,
        typeForm: "text",
      },
      {
        label: "email",
        key: "email",
        type: "text",
        sort: true,
        typeForm: "text",
      },
      {
        label: "Address",
        key: "address",
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
    const where: Prisma.CompanyWhereInput = {
      isDeleted: false,
      ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
    };

    const [dataq, total] = await Promise.all([
      prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          createdAt: true,
          isActive: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.company.count({ where }),
    ]);
    // Transform data
    const formatted = dataq.map((u) => ({
      id: u.id.toString(),
      name: u.name,
      phone: u.phone,
      email: u.email,
      address: u.address,
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
      title: "Data Company",
      header: columns,
      body: formatted,
      total: total,
      initTable: {
        buttonAdd: true,
        searchTable: true,
        editTable: false,
        permission: getPermission(userToken?.permission, "company"),
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
