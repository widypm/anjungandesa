import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { ResponseHttp } from "../../../../../lib/response";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id; // Klg.id adalah STRING (UUID), bukan number!

  if (!id) {
    const rsp = ResponseHttp(400, "Invalid id");
    return new NextResponse(rsp, {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  try {
    const query = await prisma.klg.findUnique({
      where: { id },

      include: {
        // Relasi alamat KTP
        ktpProv: true,
        ktpKota: true,
        ktpKec: true,
        ktpKel: true,

        // Relasi domisili
        domisiliProv: true,
        domisiliKota: true,
        domisiliKec: true,
        domisiliKel: true,

        // Relasi status
        status: true,

        // Relasi PTO
        lokasiPto: true,
        Pto: true,

        // Kategory
        kategory: true,

        // Log status perubahan
        statusLogs: true,
      },
    });

    if (!query) {
      const rsp = ResponseHttp(404, "Data tidak ditemukan");
      return new NextResponse(rsp, {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }
    function toPascal(input: string) {
      return input
        .split(" ")
        .filter(Boolean) // buang spasi double
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");
    }
    const result = {
      status: query.status.name,
      pto: query.Pto.name,
      kategori: query.kategory.name,
      dataDiri: {
        nik: query.nik,
        namaLengkap: query.nama,
        tempatLahir: query.tempatLahir,
        tanggalLahir: query.tanggalLahir,
      },
      alamatKtp: {
        prov: query.ktpProv.nama,
        kota: query.ktpKota.nama,
        kec: query.ktpKec.nama,
        kel: query.ktpKel.nama,
        alamat: query.ktpAlamat,
      },
      alamatDomisili: {
        prov: query.domisiliProv.nama,
        kota: query.domisiliKota.nama,
        kec: query.domisiliKec.nama,
        kel: query.domisiliKel.nama,
        alamat: query.domisiliAlamat,
      },
      [toPascal(query.kategory.fileA)]:
        query.kategory.fileA == "0" ? undefined : query?.berkas1,
      [toPascal(query.kategory.fileB)]:
        query.kategory.fileB == "0" ? undefined : query?.berkas2,
      [toPascal(query.kategory.fileC)]:
        query.kategory.fileC == "0" ? undefined : query?.berkas3,
      [toPascal(query.kategory.fileD)]:
        query.kategory.fileD == "0" ? undefined : query?.berkas4,
      [toPascal(query.kategory.description)]:
        query.kategory.description == "0" ? undefined : query?.berkas5,

      id: query.id,
      logs: query.statusLogs,
    };
    const rsp = ResponseHttp(200, "approve", result);
    return new NextResponse(rsp, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.log("error GET klg/[id]", error);

    const rsp = ResponseHttp(500, "Application Maintenance", {}, error);
    return new NextResponse(rsp, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
