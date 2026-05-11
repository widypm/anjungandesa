import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ResponseHttp } from "app/lib/response";
import { GetDecrypt } from "app/lib/helper";

const MAX_AGE_MINUTES = 30;

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText));

    const {
      nik,
      files,
      type, // Hilang | Rusak | Perpanjang
      ptoId,
      ptoLokasiId,
      requestTime,
    } = rawBody;

    // === Request Time Validation ===
    if (!requestTime) {
      return NextResponse.json(
        { error: "requestTime required" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const reqTime = new Date(requestTime).getTime();
    const diffMinutes = (now - reqTime) / 1000 / 60;

    if (diffMinutes > MAX_AGE_MINUTES) {
      return NextResponse.json(
        { error: "Request expired. Refresh halaman dan coba lagi" },
        { status: 403 }
      );
    }

    // === Validasi jenis type ===
    if (!["Hilang", "Rusak", "Perpanjang"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type Pengajuan" },
        { status: 400 }
      );
    }

    // === Dapatkan data klg berdasarkan NIK ===
    const klg = await prisma.klg.findFirst({
      where: { nik, statusId: "7" },
    });

    if (!klg) {
      const respon = ResponseHttp(400, "Data KLG tidak ditemukan", {});

      return new NextResponse(respon, {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    // === Format data ReKlg ===
    const dataReKlg: any = {
      type,
      klgId: klg.id,
      ptoId,
      ptoLokasiId: ptoLokasiId || null,
      status: "Request",
    };

    // === Sesuaikan file berdasarkan type ===
    // SAVE BASE64 FUNCTION
    function saveBase64ToFile(base64: string, filename: string) {
      const fs = require("fs");
      const path = require("path");

      try {
        if (base64) {
          const base64Data = base64.split(",")[1];
          const buffer = Buffer.from(base64Data, "base64");

          const filePath = path.join(
            process.cwd(),
            "uploads/private",
            filename
          );
          fs.writeFileSync(filePath, buffer);

          return filename;
        } else {
          return "";
        }
      } catch (err) {
        console.error("Gagal menyimpan file:", filename, err);
        throw new Error("Gagal menyimpan file");
      }
    }

    // save files
    const fileAs = saveBase64ToFile(files, `${nik}-fileA-${Date.now()}.jpg`);
    if (type === "Hilang") {
      dataReKlg.fotoSuratHilang = fileAs;
    } else if (type === "Rusak") {
      dataReKlg.fotoKartuRusak = fileAs;
    }

    // === Create ReKlg ===
    const result = await prisma.reKlg.create({
      data: dataReKlg,
    });

    const respon = ResponseHttp(200, "Success", result);

    return new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error: any) {
    console.error("[POST /ReKlg] Error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
