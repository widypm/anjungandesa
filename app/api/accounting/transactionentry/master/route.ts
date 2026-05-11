import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response"; // sesuaikan jika perlu
import { verifyAndParseToken } from "app/lib/jwtParse";

type MenuWithTranslation = {
  id: string;
  parentId?: string | null;
  description?: string;
  reference: string;
};

function buildFlatLabelPaths(
  menus: MenuWithTranslation[],
  parentId: string | null = null,
  parentPath: string = ""
): { value: string; label: string }[] {
  const result: { value: string; label: string }[] = [];
  const children = menus.filter((m) => m.parentId === parentId);

  for (const menu of children) {
    const code = menu.description
      ? menu.reference + " - " + menu.description
      : `Menu ${menu.id}`;
    const fullPath = parentPath ? `${parentPath} > ${code}` : code;

    result.push({
      value: menu.id,
      label: fullPath,
    });

    // Rekursif ke anak
    const childPaths = buildFlatLabelPaths(menus, menu.id, fullPath);
    result.push(...childPaths);
  }

  return result;
}
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const userToken: any = await verifyAndParseToken(req);
    const menus = await prisma.journalEntry.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        companyId: userToken?.companyId,
        source: "TRANSACTIONENTRY",
      },
      orderBy: {
        createdAt: "asc",
      },
      select: {
        description: true,
        id: true,
        reference: true,
      },
    });

    const options = buildFlatLabelPaths(menus);

    const respon = ResponseHttp(200, "Success", options);
    return new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[GET /role/option-flat]", error);
    const rsp = ResponseHttp(500, "Application Maintenance");
    return new NextResponse(rsp, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
