export const dynamic = "force-dynamic";

import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { verifyAndParseToken } from "app/lib/jwtParse";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const userToken: any = await verifyAndParseToken(req);

    const pages = await prisma.page.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        companyId: userToken?.companyId,
        translations: {
          some: {
            title: {
              contains: search,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        translations: true,
      },
    });

    const options = pages.map((data) => ({
      value: data.id,
      label: data.pageType + "-" + data.translations[0].title,
    }));

    const respon = ResponseHttp(200, "Success", options);
    return new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[GET /role/option-flat]", error);
    const rsp = ResponseHttp(500, "Application Maintenance");
    return new NextResponse(rsp, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
