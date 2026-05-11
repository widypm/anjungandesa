import { NextResponse } from "next/server";
import * as xlsx from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Ambil file Excel dari public (pakai fetch)
    const res = await fetch(`http://localhost:3000/djpi-prismanew2.xlsx`);
    const arrayBuffer = await res.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Parse workbook
    const workbook = xlsx.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);
    // console.log("xls", rows);
    // Lanjut bikin query...
    let queries: string[] = [];
    let kodeToId: Record<string, number> = {};
    let currentId = 1;

    function getParentId(
      kode: string,
      kodeToId: Record<string, number>
    ): number | null {
      if (!kode) return null;
      let parts = kode.split(".");
      while (parts.length > 1) {
        parts = parts.slice(0, -1);
        const candidate = parts.join(".");
        if (kodeToId[candidate]) {
          return kodeToId[candidate];
        }
      }
      return null;
    }

    for (const row of rows) {
      const kode = row["Kode"]?.toString().trim();
      const nama = row["nama"]?.toString().trim() || "";
      const satuan = row["Satuan"]?.toString().trim() || "";
      const targetvol = row["targetvol"]?.toString().trim() || "";
      const JenisPaket = row["JenisPaket"]?.toString().trim() || "";
      const lokasi = row["Lokasi"]?.toString().trim() || "";
      const metodePemilihan = row["MetodePemilihan"]?.toString().trim() || "";
      const sumberDana = row["SumberDana"]?.toString().trim() || "";

      const parentId = getParentId(kode, kodeToId);

      kodeToId[kode] = currentId;

      const query = `
INSERT INTO ProgramPaket (id, kode, nama,satuan,target,lokasi,jenisPaket,metode,sumberDana, parentId)
VALUES (${currentId}, '${kode}', '${nama.replace(
        /'/g,
        "''"
      )}','${satuan}','${targetvol}','${lokasi}','${JenisPaket}','${metodePemilihan}','${sumberDana}', ${
        parentId ?? "NULL"
      });`;

      queries.push(query.trim());
      currentId++;
    }

    return new NextResponse(queries.join("\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[GET /program/sql]", error);
    return new NextResponse("Application Maintenance", { status: 500 });
  }
}
