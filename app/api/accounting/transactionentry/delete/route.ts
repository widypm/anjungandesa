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
  const id = body.id;

  if (isNaN(id)) {
    const rsp = ResponseHttp(400, "Invalid id");
    return new NextResponse(rsp, {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const userToken = await verifyAndParseToken(req);

    const journal = await prisma.$transaction(async (tx) => {
      // soft delete journal entry
      const updatedJournal = await tx.journalEntry.update({
        where: { id, companyId: userToken?.companyId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updateBy: userToken.email,
        },
      });

      // soft delete semua journal lines child
      await tx.journalLine.updateMany({
        where: { journalId: id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          updateBy: userToken.email,
        },
      });

      return updatedJournal;
    });

    const respon = ResponseHttp(
      200,
      "Journal Entry deleted successfully",
      journal
    );
    return new NextResponse(respon, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("error update journal[id]", error);
    const rsp = ResponseHttp(500, "Application Maintenance");
    return new NextResponse(rsp, {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
