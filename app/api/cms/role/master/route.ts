import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { verifyAndParseToken } from "app/lib/jwtParse";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const userToken: any = await verifyAndParseToken(req);
    const roles = await prisma.role.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        companyId: userToken?.companyId,
      },
      orderBy: {
        name: "asc",
      },
    });

    const options = roles.map((role) => ({
      value: role.id,
      label: role.name,
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
