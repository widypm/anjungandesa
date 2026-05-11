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
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        companyId: userToken?.companyId,
        pageTranslations: {
          some: {
            title: {
              contains: search,
            },
          },
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
      include: { pageTranslations: true },
    });

    const options = categories.map((data) => ({
      value: data.id,
      label: data.pageTranslations[0].title,
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
