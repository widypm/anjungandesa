import { NextResponse } from "next/server";
import * as xlsx from "xlsx";

export const dynamic = "force-dynamic";

function excelDateToMySQLDate(excelDate: number | string): string | null {
  if (!excelDate) return null;
  if (typeof excelDate === "string" && excelDate.includes("-"))
    return excelDate;
  const serial = Number(excelDate);
  if (isNaN(serial)) return null;
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split("T")[0];
}

function extractAfterWA(input: string): string | null {
  const match = input.match(/WA\.(.*)/);
  return match ? match[1] : null;
}

export async function GET() {
  try {
    const res = await fetch(`http://localhost:3000/paketdata2.xlsx`);
    const arrayBuffer = await res.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const workbook = xlsx.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);

    const values: string[] = [];
    let id = 1;

    for (const row of rows) {
      const kode = row["kode"]?.toString().trim() || "";
      const nmpaket = row["nmpaket"]?.toString().replace(/'/g, "''") || "";
      const programPaketKode = extractAfterWA(kode) || "";

      // Buat satu array value per row
      const rowValues = [
        id,
        `'${row["kdunit"] || ""}'`,
        `'${row["kdsatker"] || ""}'`,
        `'${row["kdprogram"] || ""}'`,
        `'${row["kdgiat"] || ""}'`,
        `'${row["kdoutput"] || ""}'`,
        `'${row["kdsoutput"] || ""}'`,
        `'${row["kdkmpnen"] || ""}'`,
        `'${row["kdskmpnen"] || ""}'`,
        `'${programPaketKode}'`,
        `'${nmpaket}'`,
        `'${row["kdlokasi"] || ""}'`,
        `'${row["kdkabkota"] || ""}'`,
        `'${row["metode"] || ""}'`,
        `'${row["kdpengadaan"] || ""}'`,
        row["vol"] || 0,
        `'${row["sat"] || ""}'`,
        row["tgl_mulai"]
          ? `'${excelDateToMySQLDate(row["tgl_mulai"])}'`
          : "NULL",
        row["tgl_selesai"]
          ? `'${excelDateToMySQLDate(row["tgl_selesai"])}'`
          : "NULL",
        row["pagu_51"] || 0,
        row["pagu_52"] || 0,
        row["pagu_53"] || 0,
        row["pagu_rpm"] || 0,
        row["pagu_sbsn"] || 0,
        row["pagu_phln"] || 0,
        row["pagu_total"] || 0,
        row["real_51"] || 0,
        row["real_52"] || 0,
        row["real_53"] || 0,
        row["real_rpm"] || 0,
        row["real_sbsn"] || 0,
        row["real_phln"] || 0,
        row["real_total"] || 0,
        row["progres_keuangan"] || 0,
        row["progres_fisik"] || 0,
        row["progres_keu_jan"] || 0,
        row["progres_keu_feb"] || 0,
        row["progres_keu_mar"] || 0,
        row["progres_keu_apr"] || 0,
        row["progres_keu_mei"] || 0,
        row["progres_keu_jun"] || 0,
        row["progres_keu_jul"] || 0,
        row["progres_keu_agu"] || 0,
        row["progres_keu_sep"] || 0,
        row["progres_keu_okt"] || 0,
        row["progres_keu_nov"] || 0,
        row["progres_keu_des"] || 0,
        row["progres_fisik_jan"] || 0,
        row["progres_fisik_feb"] || 0,
        row["progres_fisik_mar"] || 0,
        row["progres_fisik_apr"] || 0,
        row["progres_fisik_mei"] || 0,
        row["progres_fisik_jun"] || 0,
        row["progres_fisik_jul"] || 0,
        row["progres_fisik_agu"] || 0,
        row["progres_fisik_sep"] || 0,
        row["progres_fisik_okt"] || 0,
        row["progres_fisik_nov"] || 0,
        row["progres_fisik_des"] || 0,
        row["ren_keu_jan"] || 0,
        row["ren_keu_feb"] || 0,
        row["ren_keu_mar"] || 0,
        row["ren_keu_apr"] || 0,
        row["ren_keu_mei"] || 0,
        row["ren_keu_jun"] || 0,
        row["ren_keu_jul"] || 0,
        row["ren_keu_agu"] || 0,
        row["ren_keu_sep"] || 0,
        row["ren_keu_okt"] || 0,
        row["ren_keu_nov"] || 0,
        row["ren_keu_des"] || 0,
        row["ren_fis_jan"] || 0,
        row["ren_fis_feb"] || 0,
        row["ren_fis_mar"] || 0,
        row["ren_fis_apr"] || 0,
        row["ren_fis_mei"] || 0,
        row["ren_fis_jun"] || 0,
        row["ren_fis_jul"] || 0,
        row["ren_fis_agu"] || 0,
        row["ren_fis_sep"] || 0,
        row["ren_fis_okt"] || 0,
        row["ren_fis_nov"] || 0,
        row["ren_fis_des"] || 0,
      ];

      values.push(`(${rowValues.join(",")})`);
      id++;
    }

    const bulkInsertQuery = `
INSERT INTO Paket (
  id, kdunit, kdsatker, kdprogram, kdgiat, kdoutput, kdsoutput, kdkmpnen, kdskmpnen,
  programPaketKode, nmpaket, kdlokasi, kdkabkota, metode, kdpengadaan, vol, sat,
  tgl_mulai, tgl_selesai,
  pagu_51, pagu_52, pagu_53, pagu_rpm, pagu_sbsn, pagu_phln, pagu_total,
  real_51, real_52, real_53, real_rpm, real_sbsn, real_phln, real_total,
  progres_keuangan, progres_fisik,
  progres_keu_jan, progres_keu_feb, progres_keu_mar, progres_keu_apr,
  progres_keu_mei, progres_keu_jun, progres_keu_jul, progres_keu_agu,
  progres_keu_sep, progres_keu_okt, progres_keu_nov, progres_keu_des,
  progres_fisik_jan, progres_fisik_feb, progres_fisik_mar, progres_fisik_apr,
  progres_fisik_mei, progres_fisik_jun, progres_fisik_jul, progres_fisik_agu,
  progres_fisik_sep, progres_fisik_okt, progres_fisik_nov, progres_fisik_des,
  ren_keu_jan, ren_keu_feb, ren_keu_mar, ren_keu_apr,
  ren_keu_mei, ren_keu_jun, ren_keu_jul, ren_keu_agu,
  ren_keu_sep, ren_keu_okt, ren_keu_nov, ren_keu_des,
  ren_fis_jan, ren_fis_feb, ren_fis_mar, ren_fis_apr,
  ren_fis_mei, ren_fis_jun, ren_fis_jul, ren_fis_agu,
  ren_fis_sep, ren_fis_okt, ren_fis_nov, ren_fis_des
) VALUES
${values.join(",\n")};
`;

    return new NextResponse(bulkInsertQuery, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[GET /paket/sql]", error);
    return new NextResponse("Application Maintenance", { status: 500 });
  }
}
