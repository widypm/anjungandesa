import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { StatusSurat } from "@prisma/client";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const statusParam = searchParams.get("status");

  let where = {};

  if (
    statusParam &&
    Object.values(StatusSurat).includes(statusParam as StatusSurat)
  ) {
    where = {
      status: statusParam as StatusSurat,
    };
  }

  // ===== LIST DATA =====
  const data = await prisma.surat.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // ===== COUNT STATUS =====
  const total = await prisma.surat.count();
  const submit = await prisma.surat.count({ where: { status: "SUBMIT" } });
  const approved = await prisma.surat.count({ where: { status: "APPROVED" } });
  const rejected = await prisma.surat.count({ where: { status: "REJECTED" } });

  // ===== CHART GROUP JENIS =====
  const jenisChart = await prisma.surat.groupBy({
    by: ["jenis"],
    _count: true,
  });

  return NextResponse.json({
    success: true,
    stats: { total, submit, approved, rejected },
    chart: jenisChart,
    data,
  });
}
