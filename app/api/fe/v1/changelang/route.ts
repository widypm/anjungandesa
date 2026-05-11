import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { getCachedMenuForFE } from "../../../../lib/controller/menu";
import { getSlugByLang } from "../../../../lib/controller/lang";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ip = searchParams.get("ip") || "1.1.1.1"; // default ip
    const slugQs = searchParams.get("slug") || "beranda"; // default slug
    const lang = searchParams.get("lang") || "ID"; // default lang
    const slug = slugQs.toLowerCase();
    const langCode = lang.toUpperCase();
    const now = new Date();

    const data = await getSlugByLang(slug, langCode);
    let dataRsp: any = { slug: data };
    const respon = ResponseHttp(200, "Success", dataRsp);
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
