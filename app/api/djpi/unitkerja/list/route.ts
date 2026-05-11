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
  formatDateToInput,
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
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = startDateParam
      ? new Date(startDateParam + "T00:00:00.000Z")
      : new Date(new Date().setHours(0, 0, 0, 0)); // default: hari ini jam 00:00

    const endDate = endDateParam
      ? new Date(endDateParam + "T23:59:59.999Z")
      : new Date(new Date().setHours(23, 59, 59, 999)); // default: hari ini jam 23:59
    const order = searchParams.get("order") === "asc" ? "asc" : "desc"; // default desc
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const isDownload = searchParams.get("isdownload"); // pdf / xls
    const skip = (page - 1) * limit;
    const userToken = await verifyAndParseToken(req);
    const formSearch = [
      {
        name: "startDate",
        value: formatDateToInput(startDate),
        type: "date",
        label: wordingTr(userToken?.langCode, "start_date"),
        cols: "col-span-4",
      },
      {
        name: "endDate",
        value: formatDateToInput(endDate),
        type: "date",
        label: wordingTr(userToken?.langCode, "end_date"),
        cols: "col-span-4",
      },
    ];

    const columns: HeaderTable[] = [
      {
        label: wordingTr(userToken?.langCode, "unit_kerja"),
        key: "unitKerjaName",
        type: "html",

        typeForm: "text",
        join: true,
      },
      {
        label: wordingTr(userToken?.langCode, "pagu_dipa"),
        key: "sumJumlah",
        type: "number",
        sort: false,
        typeForm: "text",
        join: true,
      },
      {
        label: wordingTr(userToken?.langCode, "pagu_blokir"),
        key: "sumRphBlokir",
        type: "number",
        sort: false,
        typeForm: "text",
        join: true,
      },
      {
        label: wordingTr(userToken?.langCode, "pagu_efektif"),
        key: "paguEfektif",
        type: "number",
        sort: true,
        typeForm: "text",
        join: true,
      },
    ];
    const sumByUnitKerja = await prisma.paketRkakl.groupBy({
      by: ["programPaketKode"], // Prisma belum support langsung relasi, kita group by FK ProgramPaket
      _sum: {
        jumlah: true,
        RPHBLOKIR: true,
      },
      orderBy: {
        programPaketKode: "asc",
      },
    });
    // Step 1: Ambil hasil Promise.all seperti sekarang
    const tempResults = await Promise.all(
      sumByUnitKerja.map(async (item) => {
        const program = await prisma.programPaket.findUnique({
          where: { kode: item.programPaketKode },
          include: { unitKerja: true },
        });

        return {
          unitKerjaKode: program?.unitKerja?.kode,
          unitKerjaName:
            "<a class='font-extrabold text-sky-700 underline ' href='/cms/module/detailunitkerja/djpi/list?idunit=" +
            program?.unitKerja?.id +
            "&unitname=" +
            program?.unitKerja?.name +
            "'>" +
            program?.unitKerja?.name +
            "</a>",
          sumJumlah: Number(item._sum.jumlah ?? 0),
          sumRphBlokir: Number(item._sum.RPHBLOKIR ?? 0),
          paguEfektif:
            Number(item._sum.jumlah ?? 0) - Number(item._sum.RPHBLOKIR ?? 0),
        };
      })
    );

    // Step 2: Group by unitKerjaKode agar distinct
    const groupedByUnit: Record<string, (typeof tempResults)[0]> = {};

    for (const row of tempResults) {
      if (!row.unitKerjaKode) continue; // skip jika unitKerja kosong
      if (!groupedByUnit[row.unitKerjaKode]) {
        groupedByUnit[row.unitKerjaKode] = { ...row };
      } else {
        // konversi Decimal ke number
        groupedByUnit[row.unitKerjaKode].sumJumlah =
          Number(groupedByUnit[row.unitKerjaKode].sumJumlah) +
          Number(row.sumJumlah);
        groupedByUnit[row.unitKerjaKode].sumRphBlokir =
          Number(groupedByUnit[row.unitKerjaKode].sumRphBlokir) +
          Number(row.sumRphBlokir);
        groupedByUnit[row.unitKerjaKode].paguEfektif =
          Number(groupedByUnit[row.unitKerjaKode].paguEfektif) +
          Number(row.paguEfektif);
      }
    }

    // Step 3: Convert ke array
    const distinctByUnitKerja = Object.values(groupedByUnit);

    // Handle XLS Export
    if (isDownload === "xls") {
      return await handleExportXLS(distinctByUnitKerja, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(distinctByUnitKerja, columns);
    }
    // Hitung total debit & kredit global

    const respon = ResponseHttp(200, "Success ", {
      title: "Data Unit Kerja",
      header: columns,
      body: distinctByUnitKerja,
      total: "-",
      initTable: {
        buttonAdd: false,
        searchTable: false,
        editTable: false,
        permission: getPermission(userToken?.permission, "journalreport"),

        isAction: false,
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
