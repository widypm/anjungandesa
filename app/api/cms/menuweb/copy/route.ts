import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../lib/response";
import { verifyAndParseToken } from "../../../../lib/jwtParse";
import { cleanContent, GetDecrypt } from "../../../../lib/helper";

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
    const oldMenu = await prisma.menu.findUnique({
      where: { id },
      include: {
        translations: true,
        medias: true,
      },
    });

    if (!oldMenu) {
      const rsp = ResponseHttp(404, "Not found data");
      const response = new NextResponse(rsp, {
        status: 404,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }
    // 2. Siapkan data untuk create baru
    const newMenu = await prisma.menu.create({
      data: {
        parentId: oldMenu.parentId,
        sort: oldMenu.sort,
        order: oldMenu.order,
        isActive: oldMenu.isActive,
        typeMenuId: oldMenu.typeMenuId,
        createBy: userToken.email ?? "system",
        createdAt: new Date(),
        publishAt: oldMenu.publishAt,
        companyId: userToken.companyId ?? null,

        // copy translations
        translations: {
          create: oldMenu.translations.map((t) => ({
            langCode: t.langCode,
            title: t.title + " (Copy)", // tambahin biar beda
            slug: (t.slug ?? "") + "-copy-" + Date.now(),
            linkType: t.linkType,
            pageId: t.pageId,
            categoryId: t.categoryId,
            subTitle: t.subTitle,
            description: cleanContent(t.description ?? ""),
            overview: cleanContent(t.overview ?? ""),
            createBy: userToken.email ?? "system",
            createdAt: new Date(),
            companyId: userToken.companyId ?? null,
          })),
        },
        // copy medias
        medias: {
          create: oldMenu.medias.map((m) => ({
            url: m.url,
            title: m.title,
            alt: m.alt,
            type: m.type,
            langCode: m.langCode,
            createBy: userToken.email ?? "system",
            isActive: m.isActive,
            isDeleted: m.isDeleted,
            companyId: userToken.companyId ?? null,
          })),
        },
      },
    });

    const respon = ResponseHttp(200, "Success copy data", oldMenu);
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
