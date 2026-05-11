import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../lib/response";
import { verifyAndParseToken } from "../../../lib/jwtParse";
import { GetDecrypt } from "../../../lib/helper";
export const dynamic = "force-dynamic";
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const bodyText = await req.text();
  const body = JSON.parse(GetDecrypt(bodyText));
  const id = parseInt(body.id);
  const userToken = await verifyAndParseToken(req);

  if (isNaN(userToken.userId)) {
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
    const query = await prisma.user.update({
      where: { id: Number(userToken.userId) },
      data: {
        isLogin: true,
        logOutDate: new Date(),
        updateBy: userToken.email,
        token: null,
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
    const respon = ResponseHttp(200, "Success loout", query);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.log("error update role[id]", error);
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
