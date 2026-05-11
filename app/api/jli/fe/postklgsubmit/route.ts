import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { ResponseHttp } from "app/lib/response";
import { GetDecrypt } from "app/lib/helper";
import bcrypt from "bcryptjs";

const MAX_AGE_MINUTES = 30;

export async function POST(req: Request) {
  try {
    // const body = await req.json();
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText));

    const { password, rePassword, prov, kel, nik, ptoSelected, requestTime } =
      rawBody;

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
    const salt = bcrypt.genSaltSync(12); // cost 10–12 aman
    const passbc = bcrypt.hashSync(password, salt);

    // 1. Ambil semua PTO
    const allPto = await prisma.pto.findMany({
      where: { status: 1 },
      orderBy: { name: "asc" },
    });

    if (allPto.length === 0) throw new Error("Tidak ada PTO aktif");

    // 2. Ambil counter
    let counter = await prisma.ptoAssignmentCounter.findFirst();

    if (!counter) {
      counter = await prisma.ptoAssignmentCounter.create({ data: {} });
    }

    // 3. Hitung next PTO
    const lastIndex = allPto.findIndex((p) => p.id === counter.lastPtoId);
    const nextIndex = lastIndex === -1 ? 0 : (lastIndex + 1) % allPto.length;
    const nextPtoId = allPto[nextIndex].id;

    // 4. Update counter
    await prisma.ptoAssignmentCounter.update({
      where: { id: counter.id },
      data: { lastPtoId: nextPtoId },
    });

    // 5. Update KLG
    const result = await prisma.klg.update({
      where: { nik, statusId: "1" },
      data: {
        sandi: passbc,
        ptoId: prov == "31" ? nextPtoId : ptoSelected,
        statusId: "2",
      },
    });
    //update log
    const updateLog = await prisma.klgStatusLog.create({
      data: {
        klgId: result.id,
        newStatusId: "2",
        oldStatusId: "1",
        changedBy: "sys",
        note: "New Submit KLG",
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
