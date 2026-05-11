// Cache 24 jam
export const revalidate = 86400;

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const parentId = searchParams.get("parentId");

  if (type === "provinsi") {
    const data = await prisma.provinsi.findMany();
    return NextResponse.json(data, { status: 200 });
  }

  if (type === "kota") {
    const data = await prisma.kota.findMany({
      where: { provinsiId: parentId || undefined },
    });
    return NextResponse.json(data, { status: 200 });
  }

  if (type === "kecamatan") {
    const data = await prisma.kecamatan.findMany({
      where: { kotaId: parentId || undefined },
    });
    return NextResponse.json(data, { status: 200 });
  }

  if (type === "kelurahan") {
    const data = await prisma.kelurahan.findMany({
      where: { kecamatanId: parentId || undefined },
    });
    return NextResponse.json(data, { status: 200 });
  }

  return NextResponse.json({ error: "invalid type" }, { status: 400 });
}
