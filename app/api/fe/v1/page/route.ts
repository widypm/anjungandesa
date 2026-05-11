import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { getCachedMenuForFE } from "../../../../lib/controller/menu";
import { getPageData } from "app/lib/controller/pageFe";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const cuid = searchParams.get("cuid") || ""; // default ip
    const slugQs = searchParams.get("slug") || "beranda"; // default slug

    let dataRsp: any = await getPageData(slugQs, cuid);
    const respon = ResponseHttp(200, "Success", dataRsp);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.error("[GET /page/option]", error);
    const rsp = ResponseHttp(500, "Application Maintenace", "", error);
    const response = new NextResponse(rsp, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
