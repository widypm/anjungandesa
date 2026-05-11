import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data = await prisma.surat.create({
      data: body,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
    });
  }
}
