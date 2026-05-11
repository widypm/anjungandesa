import { prisma } from "../../../../lib/prisma";
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

function getQueryOptions(searchParams: URLSearchParams) {
  return {
    sortBy: searchParams.get("sortBy") || "createdAt",
    order: searchParams.get("order") === "asc" ? "asc" : "desc",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "10", 10),
    isDownload: searchParams.get("isdownload"),
    skip:
      (parseInt(searchParams.get("page") || "1", 10) - 1) *
      parseInt(searchParams.get("limit") || "10", 10),
  };
}

function getColumns(): HeaderTable[] {
  return [
    {
      label: "NIK",
      key: "nik",
      type: "text",
      sort: true,
      typeForm: "text",
    },
    {
      label: "Kategory",
      key: "kategory",
      type: "text",
      sort: true,
      typeForm: "text",
    },
    {
      label: "Nama",
      key: "nama",
      type: "text",
      sort: true,
      typeForm: "text",
    },
    {
      label: "Jenis Kelamin",
      key: "jenisKelamin",
      type: "text",
      sort: false,
      typeForm: "text",
    },
    {
      label: "Tempat Lahir",
      key: "tempatLahir",
      type: "text",
      sort: false,
      typeForm: "text",
    },
    {
      label: "Tanggal Lahir",
      key: "tanggalLahir",
      type: "text",
      sort: true,
      typeForm: "date",
    },
    {
      label: "Status",
      key: "status",
      type: "text",
      sort: false,
      typeForm: "hide",
      join: true,
      joinSearch: {
        status: {
          name: { contains: "value" },
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
  ];
}

function getOrderBy(sortBy: string, order: string, columns: HeaderTable[]) {
  const allowedSort = Object.fromEntries(
    columns.filter((col) => col.sort).map((col) => [col.key, true])
  );

  if (allowedSort[sortBy]) {
    return { [sortBy]: order };
  }

  return { createdAt: "desc" };
}

async function fetchKlgData(
  whereConditions: any[],
  orderBy: any,
  skip: number,
  limit: number
) {
  const where: Prisma.KlgWhereInput = {
    statusId: "6",
    ...(whereConditions.length > 0 ? { AND: whereConditions } : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.klg.findMany({
      where,
      include: {
        status: true,
        ktpProv: true,
        ktpKota: true,
        ktpKec: true,
        ktpKel: true,
        domisiliProv: true,
        domisiliKota: true,
        domisiliKec: true,
        domisiliKel: true,
        kategory: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.klg.count({ where }),
  ]);

  return { data, total };
}

function formatToFlatKlg(rows: any[]) {
  return rows.map((m) => ({
    id: m.id,
    kategory: m.kategory.name,
    nik: m.nik,
    nama: m.nama,
    jenisKelamin: m.jenisKelamin,
    tempatLahir: m.tempatLahir,
    tanggalLahir: formatDateTimeIndo(m.tanggalLahir),
    status: m.status?.name,
    createdAt: formatDateTimeIndo(m.createdAt),
    children: [],
  }));
}

export async function GET(req: Request) {
  try {
    const userToken: any = await verifyAndParseToken(req);
    const { searchParams } = new URL(req.url);
    const queryOptions = getQueryOptions(searchParams);
    const columns = getColumns();

    const orderBy = getOrderBy(
      queryOptions.sortBy,
      queryOptions.order,
      columns
    );

    const whereConditions = buildSearchFilter(searchParams, columns);

    const { data, total } = await fetchKlgData(
      whereConditions,
      orderBy,
      queryOptions.skip,
      queryOptions.limit
    );

    const flatData = formatToFlatKlg(data);

    if (queryOptions.isDownload === "xls")
      return await handleExportXLS(flatData, columns);
    if (queryOptions.isDownload === "pdf")
      return await handleExportPDF(flatData, columns);

    return new NextResponse(
      ResponseHttp(200, "Success", {
        title: "Data Keluarga",
        header: columns,
        body: flatData,
        total: total,
        initTable: {
          buttonAdd: true,
          buttonCopy: true,
          searchTable: true,
          editTable: true,
          permission: getPermission(userToken?.permission, "cetak-kartu"),
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
