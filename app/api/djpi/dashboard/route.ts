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
    const result = await prisma.paket.aggregate({
      _sum: {
        pagu_total: true,
        real_total: true,
        progres_keu_jan: true,
        progres_keu_feb: true,
        progres_keu_mar: true,
        progres_keu_apr: true,
        progres_keu_mei: true,
        progres_keu_jun: true,
        progres_keu_jul: true,
        progres_keu_agu: true,
        progres_keu_sep: true,
        progres_keu_okt: true,
        progres_keu_nov: true,
        progres_keu_des: true,
      },
      _count: {
        id: true, // atau gunakan field lain, id biasanya unik
      },
    });
    const blokir = await prisma.paketRkakl.aggregate({
      _sum: {
        RPHBLOKIR: true,
      },
      _count: {
        id: true, // atau gunakan field lain, id biasanya unik
      },
    });

    const count = result._count.id;

    const avgProgress = {
      jan: Number(result._sum.progres_keu_jan ?? 0) / count,
      feb: Number(result._sum.progres_keu_feb ?? 0) / count,
      mar: Number(result._sum.progres_keu_mar ?? 0) / count,
      apr: Number(result._sum.progres_keu_apr ?? 0) / count,
      mei: Number(result._sum.progres_keu_mei ?? 0) / count,
      jun: Number(result._sum.progres_keu_jun ?? 0) / count,
      jul: Number(result._sum.progres_keu_jul ?? 0) / count,
      agu: Number(result._sum.progres_keu_agu ?? 0) / count,
      sep: Number(result._sum.progres_keu_sep ?? 0) / count,
      okt: Number(result._sum.progres_keu_okt ?? 0) / count,
      nov: Number(result._sum.progres_keu_nov ?? 0) / count,
      des: Number(result._sum.progres_keu_des ?? 0) / count,
    };
    const totalReal = Number(result._sum.real_total ?? 0);

    const avgProgressRp = [
      (avgProgress.jan / 100) * totalReal,
      (avgProgress.feb / 100) * totalReal,
      (avgProgress.mar / 100) * totalReal,
      (avgProgress.apr / 100) * totalReal,
      (avgProgress.mei / 100) * totalReal,
      (avgProgress.jun / 100) * totalReal,
      (avgProgress.jul / 100) * totalReal,
      (avgProgress.agu / 100) * totalReal,
      (avgProgress.sep / 100) * totalReal,
      (avgProgress.okt / 100) * totalReal,
      (avgProgress.nov / 100) * totalReal,
      (avgProgress.des / 100) * totalReal,
    ];

    const sumByJenis = await prisma.paket.groupBy({
      by: ["programPaketKode"], // group by FK
      _sum: {
        real_total: true,
        pagu_total: true, // sudah ada
      },
      where: {
        programPaket: {
          jenisPaket: { not: null },
        },
      },
      orderBy: {
        programPaketKode: "asc",
      },
    });

    // Gabungkan per jenisPaket
    const grouped: Record<
      string,
      { sumRealTotal: number; sumPaguTotal: number }
    > = {};

    for (const item of sumByJenis) {
      const program = await prisma.programPaket.findUnique({
        where: { kode: item.programPaketKode },
        select: { jenisPaket: true },
      });

      const jenis = program?.jenisPaket || "Unknown";

      if (!grouped[jenis])
        grouped[jenis] = { sumRealTotal: 0, sumPaguTotal: 0 };
      grouped[jenis].sumRealTotal += Number(item._sum.real_total || 0);
      grouped[jenis].sumPaguTotal += Number(item._sum.pagu_total || 0);
    }

    // Convert ke array
    const sumByJenisDistinct = Object.entries(grouped).map(
      ([jenisPaket, totals]) => ({
        jenisPaket,
        sumRealTotal: totals.sumRealTotal,
        sumPaguTotal: totals.sumPaguTotal,
      })
    );

    // Generate warna otomatis berdasarkan jumlah data
    const backgroundColors = sumByJenisDistinct.map((_, i) => {
      const hue = (i * 360) / sumByJenisDistinct.length; // sebar warna di hue 0-360
      return `hsl(${hue}, 70%, 50%)`; // HSL, saturasi 70%, lightness 50%
    });
    const respon = ResponseHttp(200, "Success", {
      title: "DJPI",
      totalPaket: result._count.id,
      totalBlokir: blokir._count.id,
      pieSumPaket: {
        labels: ["Pagu", "Realisasi", "Blokir"],
        datasets: [
          {
            data: [
              Number(result._sum.pagu_total),
              Number(result._sum.real_total),
              Number(blokir._sum.RPHBLOKIR),
            ],
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
        labels: sumByJenisDistinct.map((item) => item.jenisPaket),
        datasets: [
          {
            label: "Realisasi Total (Rp)",
            data: sumByJenisDistinct.map((item) => item.sumPaguTotal),
            backgroundColor: "rgba(244, 232, 102, 0.7)",
          },
          {
            label: "Pagu Total (Rp)",
            data: sumByJenisDistinct.map((item) => item.sumRealTotal),
            backgroundColor: "rgba(114, 220, 134, 0.7)",
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
