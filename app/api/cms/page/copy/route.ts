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
  const { searchParams } = new URL(req.url);
  const catpost = Number(searchParams.get("catpost") || 0);

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
  if (catpost) {
    try {
      const userToken = await verifyAndParseToken(req);
      const oldPage = await prisma.page.findUnique({
        where: { id },
        include: {
          translations: true,
          mediaPages: true,
          sectionsAsMain: true,
          wording: true,
        },
      });

      if (!oldPage) {
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
      // 2. Buat page baru dengan data hasil copy
      const newPage = await prisma.page.create({
        data: {
          sort: oldPage.sort,
          order: oldPage.order,
          isActive: oldPage.isActive,
          createBy: userToken.email ?? "system",
          createdAt: new Date(),
          publishAt: oldPage.publishAt,
          unPublishAt: oldPage.unPublishAt,
          pageType: oldPage.pageType,
          companyId: userToken.companyId ?? null,

          // copy translations
          translations: {
            create: oldPage.translations.map((t) => ({
              langCode: t.langCode,
              title: t.title + " (Copy)",
              slug: (t.slug ?? "") + "-copy-" + Date.now(),
              subTitle: t.subTitle,
              description: cleanContent(t.description ?? ""),
              metaDescription: t.metaDescription,
              metaKeywords: t.metaKeywords,
              metaTitle: t.metaTitle,
              ogDescription: t.ogDescription,
              canonicalUrl: t.canonicalUrl,
              ogImage: t.ogImage,
              ogTitle: t.ogTitle,
              ogType: t.ogType,
              overview: cleanContent(t.overview ?? ""),
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            })),
          },

          // copy medias
          mediaPages: {
            create: oldPage.mediaPages.map((m) => ({
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

          // copy sections
          sectionsAsMain: {
            create: oldPage.sectionsAsMain.map((s) => ({
              langCode: s.langCode,
              pageIdData: s.pageIdData,
              categoryId: s.categoryId,
              templateId: s.templateId,
              type: s.type,
              order: s.order,
              description: cleanContent(s.description ?? ""),
              image: s.image,
              secondImage: s.secondImage,
              isActive: s.isActive,
              isDeleted: s.isDeleted,
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            })),
          },

          // copy wording
          wording: {
            create: oldPage.wording.map((w) => ({
              key: w.key,
              label: w.label,
              langCode: w.langCode,
              companyId: userToken.companyId ?? null,
            })),
          },
        },
      });

      const respon = ResponseHttp(200, "Success copy data", oldPage);
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
  } else {
    try {
      const userToken = await verifyAndParseToken(req);
      // Ambil data original
      const original = await prisma.category.findUnique({
        where: { id: Number(id) },
        include: {
          pageTranslations: true,
          medias: true,
          pageCategories: true,
        },
      });

      if (!original) {
        const rsp = ResponseHttp(404, "Not found data");
        const response = new NextResponse(rsp, {
          status: 404,
          headers: {
            "Content-Type": "text/plain",
          },
        });
        return response;
      }
      // Duplikasi
      const newCategory = await prisma.category.create({
        data: {
          isActive: true,
          createBy: userToken.email ?? "system",
          createdAt: new Date(),

          pageTranslations: {
            create: original.pageTranslations.map((item) => ({
              langCode: item.langCode,
              title: item.title + " (Copy)",
              slug: (item.slug ?? "").toLowerCase() + "-copy-" + Date.now(),
              subTitle: item.subTitle,
              description: item.description,
              overview: item.overview,
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            })),
          },

          medias: {
            create: original.medias.map((m) => ({
              url: m.url,
              title: m.title,
              alt: m.alt,
              type: m.type,
              langCode: m.langCode,
              createBy: userToken.email ?? "system",
              isActive: true,
              isDeleted: false,
              companyId: userToken.companyId ?? null,
            })),
          },
          pageCategories: {
            create: original.pageCategories.map((m) => ({
              pageId: m.pageId,
              langCode: m.langCode,
              companyId: m.companyId,
            })),
          },
        },
      });
      const respon = ResponseHttp(200, "Success copy data", original);
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
}