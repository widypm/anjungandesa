import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { verifyAndParseToken } from "app/lib/jwtParse";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const userToken: any = await verifyAndParseToken(req);
    const categories = await prisma.pto.findMany({
      where: {
        status: 1,
      },
      orderBy: {
        id: "asc",
      },
    });

    const options = categories.map((data) => ({
      value: data.id,
      label: data.name,
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
    const rsp = ResponseHttp(500, "Application Maintenace", {}, error);
    const response = new NextResponse(rsp, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
