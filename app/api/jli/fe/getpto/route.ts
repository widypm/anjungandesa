// Cache 24 jam
export const revalidate = 86400;

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const parentId = searchParams.get("parentId");

  if (type === "pto") {
    const data = await prisma.pto.findMany();
    return NextResponse.json(data, { status: 200 });
  }

  if (type === "ptolokasi") {
    const data = await prisma.ptoLokasi.findMany({
      where: { ptoId: parentId || undefined },
    });
    return NextResponse.json(data, { status: 200 });
  }

  return NextResponse.json({ error: "invalid type" }, { status: 400 });
}
