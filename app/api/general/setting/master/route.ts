// app/api/table/data/route.ts
// app/api/table/data/route.ts
import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const dataq = await prisma.settingApp.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      orderBy: {
        key: "asc",
      },
    });

    const options = dataq.map((role) => ({
      value: role.id,
      label: role.key,
    }));

    const respon = ResponseHttp(200, "Success Login", options);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.error("[GET /role/option]", error);
    const rsp = ResponseHttp(500, "Application Maintenace");
    const response = new NextResponse(rsp, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
