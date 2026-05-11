import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ResponseHttp } from "app/lib/response";
import { GetDecrypt } from "app/lib/helper";

export const dynamic = "force-dynamic";

const MAX_AGE_MINUTES = 30;

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText));

    // TIME VALIDATION (max 30 minutes)
    const requestTime = Number(rawBody.requestTime);
    const now = Date.now();

    if (!requestTime || now - requestTime > MAX_AGE_MINUTES * 60 * 1000) {
      return NextResponse.json(
        { error: "Request kedaluwarsa. Silakan refresh halaman." },
        { status: 403 }
      );
    }

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
    const fileA = saveBase64ToFile(
      rawBody.fileA,
      `${rawBody?.nik}-fileA-${Date.now()}.jpg`
    );
    const fileB = saveBase64ToFile(
      rawBody.fileB,
      `${rawBody?.nik}-fileB-${Date.now()}.jpg`
    );
    const fileC = saveBase64ToFile(
      rawBody.fileC,
      `${rawBody?.nik}-fileC-${Date.now()}.jpg`
    );
    const fileD = saveBase64ToFile(
      rawBody.fileD,
      `${rawBody?.nik}-fileD-${Date.now()}.jpg`
    );
    const fileE = saveBase64ToFile(
      rawBody.fileE,
      `${rawBody?.nik}-fileE-${Date.now()}.jpg`
    );

    // update DB
    const result = await prisma.klg.update({
      where: { nik: rawBody?.nik, statusId: "1" },
      data: {
        berkas1: fileA,
        berkas2: fileB,
        berkas3: fileC,
        berkas4: fileD,
        berkas5: fileE,
      },
    });

    const respon = ResponseHttp(200, "Success", result);

    return new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("[POST /klg/upload]", error);

    return NextResponse.json(
      { error: "Terjadi kesalahan pada server", detail: error?.message },
      { status: 500 }
    );
  }
}
