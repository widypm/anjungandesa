import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../../lib/response";
export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

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
    const query = await prisma.category.findUnique({
      where: { id },
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
