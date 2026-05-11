import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../lib/response";
import { verifyAndParseToken } from "../../../../lib/jwtParse";
import { GetDecrypt } from "../../../../lib/helper";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const bodyText = await req.text();
  const body = JSON.parse(GetDecrypt(bodyText));
  const id = parseInt(body.id);

  if (isNaN(id)) {
    const rsp = ResponseHttp(400, "Invalid id");
    const response = new NextResponse(rsp, {
      status: 400,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }

  try {
    const userToken = await verifyAndParseToken(req);
    const query = await prisma.rolePermision.update({
      where: { id, companyId: userToken?.companyId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updateBy: userToken.email,
      },
    });

    if (!query) {
      const rsp = ResponseHttp(404, "Not found data");
      const response = new NextResponse(rsp, {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }
    let data: any = query;
    const respon = ResponseHttp(200, "Success Login", query);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.log("error update role[id]", error);
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
