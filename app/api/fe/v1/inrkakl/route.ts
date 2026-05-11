// app/api/import-paket/route.ts
import { NextResponse } from "next/server";
import * as xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { prisma } from "../../../../lib/prisma";

// Helper konversi ke Decimal / number aman
function toDecimal(value: any) {
  if (value === null || value === undefined || value === "") return 0;
  return Number(value);
}

// Helper konversi Excel date ke JS Date
function excelDateToJSDate(excelDate: number | string): Date | null {
  if (!excelDate) return null;
  if (typeof excelDate === "string" && excelDate.includes("-")) {
    return new Date(excelDate);
  }
  const serial = Number(excelDate);
  if (isNaN(serial)) return null;
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
}

export async function GET() {
  try {
    // Baca file lokal agar route ini tetap jalan di production/Electron.
    const filePath = path.join(process.cwd(), "public", "paketdatainrkakl.xlsx");
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);

    // Mapping ke Prisma
    const data = rows.map((row: any) => ({
      programPaketKode:
        row["kdgiat"]?.toString() +
        "." +
        row["kdoutput"]?.toString() +
        "." +
        row["kdsoutput"]?.toString() +
        "." +
        row["kdkmpnen"]?.toString() +
        "." +
        row["kdskmpnen"]?.toString(),
      thang: toDecimal(row["thang"]),
      kdjendok: row["kdjendok"]?.toString() || "",
      kdsatker: row["kdsatker"]?.toString() || "",
      kddept: row["kddept"]?.toString() || "",
      kdunit: row["kdunit"]?.toString() || "",
      kdprogram: row["kdprogram"]?.toString() || "",
      kdgiat: row["kdgiat"]?.toString() || "",
      kdoutput: row["kdoutput"]?.toString() || "",
      kdlokasi: row["kdlokasi"]?.toString() || "",
      kdkabkota: row["kdkabkota"]?.toString() || "",
      kddekon: row["kddekon"]?.toString() || "",
      kdsoutput: row["kdsoutput"]?.toString() || "",
      kdkmpnen: row["kdkmpnen"]?.toString() || "",
      kdskmpnen: row["kdskmpnen"]?.toString() || "",
      kdakun: row["kdakun"]?.toString() || "",
      kdkppn: row["kdkppn"]?.toString() || "",
      kdbeban: row["kdbeban"]?.toString() || "",
      kdjnsban: row["kdjnsban"]?.toString() || "",
      kdctarik: row["kdctarik"]?.toString() || "",
      register: row["register"]?.toString() || null,
      carahitung: row["carahitung"]?.toString() || null,
      header1: row["header1"]?.toString() || null,
      header2: row["header2"]?.toString() || null,
      kdheader: row["kdheader"]?.toString() || null,
      noitem: row["noitem"]?.toString() || null,
      nmitem: row["nmitem"]?.toString() || "",
      vol1: toDecimal(row["vol1"]),
      sat1: row["sat1"]?.toString() || null,
      vol2: toDecimal(row["vol2"]),
      sat2: row["sat2"]?.toString() || null,
      vol3: toDecimal(row["vol3"]),
      sat3: row["sat3"]?.toString() || null,
      vol4: toDecimal(row["vol4"]),
      sat4: row["sat4"]?.toString() || null,
      volkeg: toDecimal(row["volkeg"]),
      satkeg: row["satkeg"]?.toString() || null,
      hargasat: toDecimal(row["hargasat"]),
      jumlah: toDecimal(row["jumlah"]),
      jumlah2: toDecimal(row["jumlah2"]),
      paguphln: toDecimal(row["paguphln"]),
      pagurmp: toDecimal(row["pagurmp"]),
      pagurkp: toDecimal(row["pagurkp"]),
      kdblokir: row["kdblokir"]?.toString() || null,
      BLOKIRPHLN: toDecimal(row["BLOKIRPHLN"]),
      BLOKIRRMP: toDecimal(row["BLOKIRRMP"]),
      BLOKIRRKP: toDecimal(row["BLOKIRRKP"]),
      RPHBLOKIR: toDecimal(row["RPHBLOKIR"]),
      KDCOPY: row["KDCOPY"]?.toString() || null,
      KDABT: row["KDABT"]?.toString() || null,
      KDSBU: row["KDSBU"]?.toString() || null,
      VOLSBK: toDecimal(row["VOLSBK"]),
      VOLRKAKL: toDecimal(row["VOLRKAKL"]),
      BLNKONTRAK: toDecimal(row["BLNKONTRAK"]),
      NOKONTRAK: row["NOKONTRAK"]?.toString() || null,
      TGKONTRAK: excelDateToJSDate(row["TGKONTRAK"]),
      NILKONTRAK: toDecimal(row["NILKONTRAK"]),
      JANUARI: toDecimal(row["JANUARI"]),
      PEBRUARI: toDecimal(row["PEBRUARI"]),
      MARET: toDecimal(row["MARET"]),
      APRIL: toDecimal(row["APRIL"]),
      MEI: toDecimal(row["MEI"]),
      JUNI: toDecimal(row["JUNI"]),
      JULI: toDecimal(row["JULI"]),
      AGUSTUS: toDecimal(row["AGUSTUS"]),
      SEPTEMBER: toDecimal(row["SEPTEMBER"]),
      OKTOBER: toDecimal(row["OKTOBER"]),
      NOPEMBER: toDecimal(row["NOPEMBER"]),
      DESEMBER: toDecimal(row["DESEMBER"]),
      JMLTUNDA: toDecimal(row["JMLTUNDA"]),
      KDLUNCURAN: row["KDLUNCURAN"]?.toString() || null,
      JMLABT: toDecimal(row["JMLABT"]),
      NOREV: row["NOREV"]?.toString() || null,
      KDUBAH: row["KDUBAH"]?.toString() || null,
      KURS: toDecimal(row["KURS"]),
      INDEXKPJM: row["INDEXKPJM"]?.toString() || null,
      KDIB: row["KDIB"]?.toString() || null,
    }));

    // SQLite tidak mendukung skipDuplicates untuk createMany.
    await prisma.paketRkakl.deleteMany();

    // Bulk insert ke Prisma
    await prisma.paketRkakl.createMany({
      data,
    });

    return NextResponse.json({ message: "Insert selesai", count: data.length });
  } catch (error) {
    console.error("[API /import-paket]", error);
    return NextResponse.json(
      { error: "Failed to import XLSX" },
      { status: 500 }
    );
  }
}
