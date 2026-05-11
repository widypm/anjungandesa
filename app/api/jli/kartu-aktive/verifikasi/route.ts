import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ResponseHttp } from "app/lib/response";
import { GetDecrypt } from "app/lib/helper";
import bcrypt from "bcryptjs";
import { verifyAndParseToken } from "app/lib/jwtParse";

const MAX_AGE_MINUTES = 30;

export async function POST(req: Request) {
  try {
    // const body = await req.json();
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText));

    const { id, action } = rawBody;

    // 5. Update KLG
    const result = await prisma.klg.update({
      where: { id, statusId: "2" },
      data: {
        statusId: action == 1 ? "3" : "4",
      },
    });
    //update log
    const userToken = await verifyAndParseToken(req);
    const updateLog = await prisma.klgStatusLog.create({
      data: {
        klgId: result.id,
        newStatusId: action == 1 ? "3" : "4",
        oldStatusId: "2",
        changedBy: userToken.email,
        note: "Pengajuan Di setujui",
      },
    });
    const respon = ResponseHttp(200, "Success", result);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
