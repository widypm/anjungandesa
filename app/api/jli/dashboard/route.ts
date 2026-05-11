import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../lib/response";
import { AccountType } from "@prisma/client";
import { prisma } from "../../../lib/prisma"; // pastikan path benar
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    // Semua opsi
    const avgProgressRp = [
      100, 200, 400, 500, 600, 700, 200, 200, 800, 800, 200, 200,
    ];

    const golongan = [
      {
        src: "/images/klg/lansia.png",
        text: "Lansia",
        vol: 100,
      },
      {
        src: "/images/klg/veteran.png",
        text: "Veteran",
        vol: 300,
      },
      {
        src: "/images/klg/pns.png",
        text: "PNS / Pensiunan",
        vol: 200,
      },
      {
        src: "/images/klg/anggota-pkk.png",
        text: "Anggota PKK",
        vol: 100,
      },
      {
        src: "/images/klg/icon-rusunawa.png",
        text: "Penghuni Rusunawa",

        vol: 300,
      },
      {
        src: "/images/klg/tni-polri.png",
        text: "Anggota TNI/POLRI",

        vol: 300,
      },
      {
        src: "/images/klg/icon-penjagaribadah.png",
        text: "Penjaga Rumah Ibadah",

        vol: 400,
      },
      {
        src: "/images/klg/icon-disabilitas.png",
        text: "Penyandang Disabilitas",

        vol: 200,
      },
      {
        src: "/images/klg/kjp.png",
        text: "Peserta Didik Penerima KJP",
        vol: 300,
      },
      {
        src: "/images/klg/kontrak.png",
        text: "Tenaga Kontrak DKI Jakarta",
        vol: 400,
      },
      {
        src: "/images/klg/guru-tk.png",
        text: "Pendidik & Tenaga Kependidikan PAUD",
        vol: 300,
      },
      {
        src: "/images/klg/pulau-seribu.png",
        text: "Penduduk Kepulauan Seribu",
        vol: 300,
      },
      {
        src: "/images/klg/karyawan-swasta.png",
        text: "Karyawan Swasta Pemegang Kartu Pekerja Jakarta",
        vol: 200,
      },
      {
        src: "/images/klg/bantuan-sosial.png",
        text: "Penerima Bantuan Sosial Untuk Pemenuhan Kebutuhan Dasar Bagi anak",
        vol: 400,
      },
      {
        src: "/images/klg/golmas.png",
        text: "Juru pemantau jentik, Karang Taruna, Dasawisma, Pos Pelayanan Terpadu. ",
        vol: 600,
      },
    ];
    const respon = ResponseHttp(200, "Success", {
      title: "Monitoring",
      totalPaket: 12724,
      totalBlokir: 1730,
      pieSumPaket: {
        labels: ["Transjakarta", "MRT", "LRT"],
        datasets: [
          {
            data: [Number(30), Number(30), Number(40)],
            backgroundColor: [
              "rgba(54, 162, 235, 0.8)",
              "rgba(12, 186, 44, 0.8)",
              "rgba(246, 59, 8, 0.96)",
            ],
            borderWidth: 1,
          },
        ],
      },
      barSumPaket: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agu",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ],
        datasets: [
          {
            label: "Progres Per Bulan",
            data: avgProgressRp,
            borderWidth: 1,
            // backgroundColor default provided for clarity
            backgroundColor: "rgba(54, 162, 235, 0.7)",
          },
        ],
      },
      barSumJenisPaket: {
        labels: golongan.map((item) => item.text),
        datasets: [
          {
            label: "Total data",
            data: golongan.map((item) => item.vol),
            backgroundColor: "rgba(239, 69, 69, 0.7)",
          },
        ],
      },
    });
    return new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "application/json", // ubah ke json
      },
    });
  } catch (error) {
    console.error("[GET /role/option]", error);
    const rsp = ResponseHttp(500, "Application Maintenance");
    return new NextResponse(rsp, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
