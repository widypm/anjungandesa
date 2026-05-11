import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ResponseHttp } from "app/lib/response";
import { GetDecrypt } from "app/lib/helper";

const MAX_AGE_MINUTES = 30;

export async function POST(req: Request) {
  try {
    // const body = await req.json();
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText));

    const { pto, ptoLokasi, nik, requestTime } = rawBody;

    // === Validasi Request Time ===
    if (!requestTime) {
      return NextResponse.json(
        { error: "requestTime required" },
        { status: 400 }
      );
    }

    const now = Date.now();
    const reqTime = new Date(requestTime).getTime();

    if (isNaN(reqTime)) {
      const respon = ResponseHttp(400, "Invalid requestTime format", {});
      const response = new NextResponse(respon, {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }

    const diffMinutes = (now - reqTime) / 1000 / 60;

    if (diffMinutes > MAX_AGE_MINUTES) {
      const respon = ResponseHttp(
        403,
        "Request expired. Refresh halaman dan coba lagi",
        {}
      );
      const response = new NextResponse(respon, {
        status: 403,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }

    const result = await prisma.klg.update({
      where: { nik: nik, statusId: "1" },
      data: {
        ptoId: pto?.value,
        ptoLokasiId: ptoLokasi?.value,
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
