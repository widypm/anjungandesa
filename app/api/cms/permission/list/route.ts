// app/api/table/data/route.ts
import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { buildSearchFilter } from "../../../../lib/buildSearchFilter";
import { handleExportXLS } from "../../../../lib/exportXls";
import { handleExportPDF } from "../../../../lib/exportPdf";
import { HeaderTable } from "../../../../types";
import { formatDateTimeIndo, getPermission } from "../../../../lib/helper";
import { title } from "process";
import { create } from "domain";
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
        label: "Role",
        key: "roleId",
        type: "text",
        sort: true,
        typeForm: "select-single",
        uriSelect: "api/cms/role/master",
        join: true,
        joinSearch: {
          role: {
            name: { contains: "value" },
          },
        },
      },
      {
        label: "Menu",
        key: "menuId",
        type: "text",
        sort: false,
        typeForm: "select-single",
        uriSelect: "api/cms/menu/master",
        join: true,
        joinSearch: {
          menu: {
            translations: {
              some: {
                langCode: "ID",
                title: {
                  contains: "value",
                },
              },
            },
          },
        },
      },
      {
        label: "View",
        key: "view",
        type: "boolean",
        noSearch: true,
        typeForm: "switch",
      },
      {
        label: "Create",
        key: "create",
        type: "boolean",
        noSearch: true,
        typeForm: "switch",
      },
      {
        label: "Update",
        key: "update",
        type: "boolean",
        noSearch: true,
        typeForm: "switch",
      },
      {
        label: "Delete",
        key: "deleted",
        type: "boolean",
        noSearch: true,
        typeForm: "switch",
      },
      {
        label: "Created At",
        key: "createdAt",
        type: "text",
        sort: true,
        noSearch: true,
        typeForm: "hide",
      },
      {
        label: "Active",
        key: "isActive",
        type: "boolean",
        noSearch: true,
        typeForm: "switch",
      },
    ];
    const allowedSort = Object.fromEntries(
      columns.filter((col) => col.sort).map((col) => [col.key, true])
    );
    // Sort object untuk Prisma
    let orderBy: any = { createdAt: "desc" };
    if (allowedSort[sortBy]) {
      if (sortBy == "roleId") {
        orderBy = { role: { name: order } };
      } else if (sortBy == "menuId") {
        orderBy = { menu: { title: order } };
      } else {
        orderBy = { [sortBy]: order };
      }
    }
    const userToken: any = await verifyAndParseToken(req);
    const whereConditions = buildSearchFilter(searchParams, columns);
    // Gabung semua kondisi where jadi 1 objek
    const where: Prisma.RolePermisionWhereInput = {
      isDeleted: false,
      companyId: userToken?.companyId,
      ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
    };

    const [role, total] = await Promise.all([
      prisma.rolePermision.findMany({
        where: {
          ...where,
        },
        select: {
          id: true,
          view: true,
          create: true,
          deleted: true,
          update: true,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
          menu: {
            select: {
              id: true,
              parent: {
                select: {
                  id: true,
                  translations: {
                    where: { langCode: "ID" },
                    select: { title: true },
                    take: 1,
                  },
                },
              },
              translations: {
                where: { langCode: "ID" },
                select: { title: true },
                take: 1,
              },
            },
          },
          createdAt: true,
          isActive: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.rolePermision.count({ where }),
    ]);

    // Transform data
    const formatted = role.map((u) => {
      const parentTitle = u.menu.parent?.translations[0]?.title ?? "";
      const menuTitle = u.menu.translations[0]?.title ?? "";
      const label = parentTitle ? `${parentTitle} > ${menuTitle}` : menuTitle;

      return {
        id: u.id.toString(),
        roleId: { label: u.role.name, value: u.role.id },
        menuId: { value: u.menu.id, label },
        view: u.view,
        deleted: u.deleted,
        update: u.update,
        create: u.create,
        createdAt: formatDateTimeIndo(u.createdAt),
        isActive: u.isActive,
      };
    });
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
      title: "Data Permission",
      header: columns,
      body: formatted,
      total: total,
      initTable: {
        buttonAdd: true,
        searchTable: true,
        editTable: true,
        permission: getPermission(userToken?.permission, "permission"),
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
