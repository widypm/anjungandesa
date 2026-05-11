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
      nama,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      ktpProvId,
      ktpKotaId,
      ktpKecId,
      ktpKelId,
      ktpAlamat,
      domisiliProvId,
      domisiliKotaId,
      domisiliKecId,
      domisiliKelId,
      domisiliAlamat,
      klgKategory,
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

    if (isNaN(reqTime)) {
      return NextResponse.json(
        { error: "Invalid requestTime format" },
        { status: 400 }
      );
    }

    const diffMinutes = (now - reqTime) / 1000 / 60;

    if (diffMinutes > MAX_AGE_MINUTES) {
      return NextResponse.json(
        { error: "Request expired. Refresh halaman dan coba lagi" },
        { status: 403 }
      );
    }

    // === Format data untuk create/update ===
    const payload = {
      nik,
      nama,
      jenisKelamin,
      tempatLahir,
      tanggalLahir: new Date(tanggalLahir),
      ktpProvId,
      ktpKotaId,
      ktpKecId,
      ktpKelId,
      ktpAlamat,
      statusId: "1",
      kategoryId: klgKategory,
      domisiliProvId: domisiliProvId || null,
      domisiliKotaId: domisiliKotaId || null,
      domisiliKecId: domisiliKecId || null,
      domisiliKelId: domisiliKelId || null,
      domisiliAlamat: domisiliAlamat || null,
      oldData: 1,
    };

    // === Cek apakah sudah ada data dengan nik + statusId=1 ===
    const existing = await prisma.klg.findFirst({
      where: { nik, statusId: "1" },
    });

    let result;

    if (existing) {
      // ==== UPDATE kalau sudah ada ====
      result = await prisma.klg.update({
        where: { id: existing.id }, // pakai PK untuk update
        data: payload,
      });
    } else {
      // ==== CREATE baru ====
      result = await prisma.klg.create({
        data: payload,
      });
    }

    const respon = ResponseHttp(200, "Success", result);

    return new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("[POST /klg] Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
