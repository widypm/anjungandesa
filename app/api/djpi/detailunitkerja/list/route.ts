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

async function getProgramPaketSummary(unitKerjaId?: number) {
  // 1. Ambil semua ProgramPaket (tanpa children)
  const allProgramsRaw = await prisma.programPaket.findMany({
    include: { unitKerja: true }, // 🚫 jangan include children
    orderBy: { kode: "asc" },
  });

  // 🔑 Dedup berdasarkan kode
  const allPrograms = Object.values(
    allProgramsRaw.reduce((acc, prog) => {
      const kode = prog.kode;
      if (!acc[kode]) {
        acc[kode] = prog;
      } else {
        if (!acc[kode].unitKerjaId && prog.unitKerjaId) {
          acc[kode] = prog; // replace kalau versi lama gak ada unitKerja
        }
      }
      return acc;
    }, {} as Record<string, (typeof allProgramsRaw)[0]>)
  );

  // 2. Ambil semua PaketRkakl
  const allPaketRkakl = await prisma.paketRkakl.findMany();

  // Map sum per programPaketKode
  const paketMap: Record<string, { sumJumlah: number; sumRphBlokir: number }> =
    {};
  for (const paket of allPaketRkakl) {
    const kode = paket.programPaketKode;
    if (!paketMap[kode]) paketMap[kode] = { sumJumlah: 0, sumRphBlokir: 0 };
    paketMap[kode].sumJumlah += Number(paket.jumlah);
    paketMap[kode].sumRphBlokir += Number(paket.RPHBLOKIR);
  }

  // 3. Buat map program by id
  const programMap = allPrograms.reduce((acc, prog) => {
    acc[prog.id] = { ...prog, children: [] }; // tambahkan slot children
    return acc;
  }, {} as Record<number, (typeof allPrograms)[0] & { children: any[] }>);

  // 4. Bangun tree manual
  const roots: (typeof allPrograms)[0][] = [];
  allPrograms.forEach((prog) => {
    if (prog.parentId) {
      const parent = programMap[prog.parentId];
      if (parent) parent.children.push(programMap[prog.id]); // pakai reference dari programMap
    } else {
      roots.push(programMap[prog.id]);
    }
  });

  // 5. Rekursif summary
  function buildSummary(
    prog: (typeof allPrograms)[0] & { children: any[] },
    unitKerjaId?: number
  ): any | null {
    let sums = {
      sumJumlah: paketMap[prog.kode]?.sumJumlah ?? 0,
      sumRphBlokir: paketMap[prog.kode]?.sumRphBlokir ?? 0,
    };

    const childrenSummary = prog.children
      .map((child) => buildSummary(child, unitKerjaId))
      .filter((child): child is NonNullable<typeof child> => child !== null);

    if (childrenSummary.length > 0) {
      sums = { sumJumlah: 0, sumRphBlokir: 0 };
      for (const childSum of childrenSummary) {
        sums.sumJumlah += childSum.sumJumlah;
        sums.sumRphBlokir += childSum.sumRphBlokir;
      }
    } else {
      // leaf → filter
      if (unitKerjaId && prog.unitKerjaId !== unitKerjaId) {
        return null;
      }
    }

    return {
      id: prog.id,
      kode: prog.kode,
      nama: prog.nama,
      lokasi: prog.lokasi,
      target: prog.target,
      satuan: prog.satuan,
      jenispaket: prog.jenisPaket,
      sumberdana: prog.sumberDana,
      unitKerja: prog.unitKerja?.name ?? "-",
      pagu: Number(prog.pagu),
      realisasi: Number(prog.realisasi),
      blokir: Number(prog.blokir),
      keu: Number(prog.keu),
      fisik: Number(prog.fisik),
      thang: prog.thang,
      sumJumlah: sums.sumJumlah,
      sumRphBlokir: sums.sumRphBlokir,
      paguEfektif: sums.sumJumlah - sums.sumRphBlokir,
      parentId: prog.parentId ?? null,
      children: childrenSummary,
    };
  }

  // 6. Ambil summary dari root saja
  const summary = roots
    .map((root: any) => buildSummary(root, unitKerjaId))
    .filter((root) => root !== null);

  return summary;
}

// Example usage

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "createdAt"; // default sorting
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const unitname = searchParams.get("unitname") || "";
    const idunit = Number(searchParams.get("idunit") || 0);

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

    const columns: HeaderTable[] = [
      {
        label: wordingTr(userToken?.langCode, "kode"),
        key: "kode",
        type: "text",
        typeForm: "text",
        join: true,
      },
      {
        label: wordingTr(userToken?.langCode, "nama"),
        key: "nama",
        type: "text",
        typeForm: "text",
        join: true,
      },
      {
        label: wordingTr(userToken?.langCode, "Unit"),
        key: "unitKerja",
        type: "html",
        typeForm: "text",
        join: true,
      },
      {
        label: wordingTr(userToken?.langCode, "target"),
        key: "target",
        type: "text",
        typeForm: "text",
        join: true,
      },
      // {
      //   label: wordingTr(userToken?.langCode, "satuan"),
      //   key: "satuan",
      //   type: "text",
      //   typeForm: "text",
      //   join: true,
      // },
      // {
      //   label: wordingTr(userToken?.langCode, "lokasi"),
      //   key: "lokasi",
      //   type: "text",
      //   typeForm: "text",
      //   join: true,
      // },
      {
        label: wordingTr(userToken?.langCode, "jenis_paket"),
        key: "jenispaket",
        type: "text",
        typeForm: "text",
        join: true,
      },
      {
        label: wordingTr(userToken?.langCode, "sumber_dana"),
        key: "sumberdana",
        type: "text",
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
    const summary = idunit
      ? await getProgramPaketSummary(idunit)
      : await getProgramPaketSummary();

    // Handle XLS Export
    if (isDownload === "xls") {
      return await handleExportXLS(summary, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(summary, columns);
    }
    // Hitung total debit & kredit global

    const respon = ResponseHttp(200, "Success ", {
      title: "Data Paket " + unitname,
      header: columns,
      body: summary,
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
