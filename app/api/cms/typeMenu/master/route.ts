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
    const roles = await prisma.menuType.findMany({
      where: search
        ? {
            name: {
              contains: search,
            },
            companyId: userToken?.companyId,
          }
        : { companyId: userToken?.companyId },
      orderBy: {
        name: "asc",
      },
    });

    const options = roles.map((role) => ({
      value: role.id,
      label: role.name,
    }));

    const respon = ResponseHttp(200, "Success ", options);
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
