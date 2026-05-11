import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../../lib/response";
import { Step } from "../../../../../types";
import { GetDecrypt, toPrismaDateTime } from "../../../../../lib/helper";
import { verifyAndParseToken } from "../../../../../lib/jwtParse";
import { wordingTr } from "app/lib/translationWording";
export const dynamic = "force-dynamic";
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userToken = await verifyAndParseToken(req);
    const id = parseInt(params.id);
    // example get langs array
    const langDat = await prisma.lang.findMany({
      where: { isActive: true },
      orderBy: {
        code: "desc", // atau 'desc' jika ingin urutan menurun
      },
    });
    // Misalnya kita ambil user pertama (atau dari token, params, dll)
    let query = null;
    if (id > 0) {
      query = await prisma.menu.findUnique({
        where: { id },
        include: {
          translations: {
            include: {
              category: { include: { pageTranslations: true } },
              page: { include: { translations: true } },
            },
          },
          typeMenu: true,
          parent: {
            include: { translations: { where: { langCode: "ID" } } },
          },
          medias: true,
        },
      });

      if (!query || query.isDeleted) {
        return new NextResponse(ResponseHttp(404, "Data Not Found"), {
          status: 404,
        });
      }
    }
    // Form step
    const translationMap = (query?.translations || []).reduce((acc, curr) => {
      acc[curr.langCode.toUpperCase()] = curr;
      return acc;
    }, {} as Record<string, any>);
    const langs = langDat.map((lang) => {
      const langCode = lang.code.toUpperCase();
      const trans = translationMap[langCode] || {};
      const steps: Step[] = [
        {
          title: "Main",
          fields: [
            {
              name: "id",
              label: "id",
              type: "hide",
              value: query?.id ?? "",
              allLang: true,
            },
            {
              name: "title",
              label: wordingTr(userToken?.langCode, "title_menu"),
              info: wordingTr(userToken?.langCode, "info_title_menu"),
              type: "text",
              value: trans?.title ?? "",
            },
            {
              name: "subTitle",
              label: wordingTr(userToken?.langCode, "sub_title"),
              info: wordingTr(userToken?.langCode, "info_sub_title_menu"),
              type: "text",
              value: trans?.subTitle ?? "",
            },
            {
              name: "typeMenuId",
              label: wordingTr(userToken?.langCode, "type_menu"),
              info: wordingTr(userToken?.langCode, "info_type_menu"),
              type: "select-single",
              value: query?.typeMenuId
                ? { value: query?.typeMenuId, label: query?.typeMenu?.name }
                : null,
              uriSelect: "api/cms/typeMenu/master",
              allLang: true,
            },
            {
              name: "parent",
              label: wordingTr(userToken?.langCode, "parent_menu"),
              info: wordingTr(userToken?.langCode, "info_select_parent_menu"),
              type: "select-single",
              value: query?.parentId
                ? {
                    value: query?.parentId,
                    label: query?.parent?.translations[0].title,
                  }
                : null,
              uriSelect: "api/cms/menuweb/master",
              allLang: true,
            },
            {
              name: "linkType",
              label: wordingTr(userToken?.langCode, "link_type"),
              info: wordingTr(userToken?.langCode, "info_select_link_type"),
              type: "select-single",
              value: {
                value: trans?.linkType == null ? "URL" : trans?.linkType,
                label: trans?.linkType == null ? "Url" : trans?.linkType,
              },
              uriSelect: "api/cms/linkType/master",
              allLang: true,
            },
            {
              name: "slug",
              label: wordingTr(userToken?.langCode, "url"),
              info: wordingTr(userToken?.langCode, "info_url_menu"),
              type: "text",
              value: trans?.slug ?? "",
              cols: "col-span-6",
              hideFields: [
                {
                  name: "linkType",
                  value: ["PAGE", "CATEGORY"],
                },
              ],
            },
            {
              name: "pageId",
              label: wordingTr(userToken?.langCode, "page"),
              info: wordingTr(userToken?.langCode, "info_select_page_menu"),
              type: "select-single",
              value: trans?.pageId
                ? {
                    value: trans?.pageId == null ? null : trans?.pageId,
                    label:
                      trans?.pageId == null
                        ? "Url"
                        : trans?.page?.translations[0]?.title,
                  }
                : null,
              cols: "col-span-6",
              hideFields: [
                {
                  name: "linkType",
                  value: ["CATEGORY", "URL"],
                },
              ],
              uriSelect: "api/cms/page/master",
              allLang: true,
            },
            {
              name: "categoryId",
              label: "Category",
              type: "select-single",
              value: trans?.categoryId
                ? {
                    value:
                      trans?.categoryId == null ? "URL" : trans?.categoryId,
                    label:
                      trans?.categoryId == null
                        ? "Url"
                        : trans?.category?.pageTranslations?.title,
                  }
                : null,
              cols: "col-span-6",
              hideFields: [
                {
                  name: "linkType",
                  value: ["URL", "PAGE"],
                },
              ],
              uriSelect: "api/cms/category/master",
              allLang: true,
            },
            {
              name: "overview",
              label: wordingTr(userToken?.langCode, "overview"),
              info: wordingTr(userToken?.langCode, "info_overview_menu"),
              type: "text-editor",
              value: trans?.overview ?? "",
              cols: "col-span-6",
            },
            {
              name: "description",
              label: wordingTr(userToken?.langCode, "description"),
              info: wordingTr(userToken?.langCode, "info_description_menu"),
              type: "text-editor",
              cols: "col-span-6",
              value: trans?.description ?? "",
            },
          ],
        },

        {
          title: "Media",
          fields: [
            {
              name: "media_image",
              label: "Image Default",
              type: "upload-fm",
              value: query?.medias.find(
                (item) =>
                  item.type === "media_image" && item.langCode === langCode
              ),
            },
            {
              name: "media_icon",
              label: "Icon",
              type: "upload-fm",
              value: query?.medias.find(
                (item) =>
                  item.type === "media_icon" && item.langCode === langCode
              ),
            },
            {
              name: "media_thumbnail",
              label: "Thumbnail",
              type: "upload-fm",
              value: query?.medias.find(
                (item) =>
                  item.type === "media_thumbnail" && item.langCode === langCode
              ),
            },
            {
              name: "media_imagePhone",
              label: "Image Phone",
              type: "upload-fm",
              value: query?.medias.find(
                (item) =>
                  item.type === "media_imagePhone" && item.langCode === langCode
              ),
            },
            {
              name: "media_banner",
              label: "Banner",
              type: "upload-fm",
              value: query?.medias.find(
                (item) =>
                  item.type === "media_banner" && item.langCode === langCode
              ),
            },
          ],
        },
        {
          title: "Security",
          fields: [
            {
              name: "publishAt",
              label: "Publish Date",
              type: "datetime-local",
              value: query?.publishAt
                ? query?.publishAt.toISOString().slice(0, 16)
                : "",
              allLang: true,
            },
            {
              name: "unPublishAt",
              label: "UnPublish Date",
              type: "datetime-local",
              value: query?.unPublishAt
                ? query?.unPublishAt.toISOString().slice(0, 16)
                : "",
              allLang: true,
            },
            {
              name: "isActive",
              label: "Active",
              type: "switch",
              value: query?.isActive ?? false,
              allLang: true,
            },
          ],
        },
      ];

      return {
        name: langCode,
        data: steps,
      };
    });

    //default json text
    const respon = ResponseHttp(200, "Success Login", {
      title: "Form Menu",
      data: langs,
    });
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.log("[Role Create-form error]", error);
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
export async function POST(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText)); // body: { ID: {...}, EN: {...} }
    const body = Object.entries(rawBody).map(([lang, value]) => ({
      lang: lang.toUpperCase(),
      value,
    }));
    const result = await saveOrUpdateUser(body, userToken);

    if (result.error) {
      const respon = ResponseHttp(400, "Maintenace Server", {});
      const response = new NextResponse(respon, {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }

    const respon = ResponseHttp(200, result.success, result.data);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.error("[User POST Error]", error);
    const respon = ResponseHttp(500, "Internal Server Error", {});
    const response = new NextResponse(respon, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
export async function PUT(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText)); // body: { ID: {...}, EN: {...} }
    const body = Object.entries(rawBody).map(([lang, value]) => ({
      lang: lang.toUpperCase(),
      value,
    }));

    const result = await saveOrUpdateUser(body, userToken);

    if (result.error) {
      const respon = ResponseHttp(400, result.error, {});
      const response = new NextResponse(respon, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }
    const respon = ResponseHttp(200, result.success, result.data);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.error("[User PUT Error]", error);
    const respon = ResponseHttp(500, "Internal Server Error", {});
    const response = new NextResponse(respon, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
async function saveOrUpdateUser(
  langArray: { lang: string; value: any }[],
  userToken: any
) {
  //console.log("test", langArray);
  if (!Array.isArray(langArray)) {
    return { error: "Field tidak lengkap" };
  }
  try {
    if (langArray[0].value.value.id) {
      // Loop dan jalankan manual upsert untuk translation dan media
      await prisma.menu.update({
        where: { id: langArray[0].value.value.id },
        data: {
          parentId: langArray[0].value.value.parent.value ?? null,

          isActive: langArray[0].value.value.isActive ?? true,
          typeMenuId: langArray[0].value.value.typeMenuId.value ?? null,
          updateBy: userToken.email ?? "system",
          updatedAt: new Date(),
        },
      });

      const menuTranslationUpserts = langArray.map((item) =>
        prisma.menuTranslation.upsert({
          where: {
            menuId_langCode: {
              menuId: langArray[0].value.value.id,
              langCode: item.value.lang,
            },
          },
          update: {
            title: item.value.value.title,
            slug: item.value.value.slug ?? "",
            subTitle: item.value.value.subTitle ?? null,
            linkType: item.value.value.linkType?.value ?? "URL",
            pageId: item.value.value.pageId?.value ?? null,
            categoryId: item.value.value.categoryId?.value ?? null,
            description: item.value.value.description ?? null,
            overview: item.value.value.overview ?? null,
            updateBy: userToken.email ?? "system",
            updatedAt: new Date(),
          },
          create: {
            menuId: langArray[0].value.value.id,
            langCode: item.value.lang,
            title: item.value.value.title,
            slug: item.value.value.slug ?? "",
            linkType: item.value.value.linkType?.value ?? "URL",
            pageId: item.value.value.pageId?.value ?? null,
            categoryId: item.value.value.categoryId?.value ?? null,
            subTitle: item.value.value.subTitle ?? null,
            description: item.value.value.description ?? null,
            overview: item.value.value.overview ?? null,
            createBy: userToken.email ?? "system",
            createdAt: new Date(),
            companyId: userToken.companyId ?? null,
          },
        })
      );

      const mediaUpserts = langArray.flatMap((item) => {
        const keys = Object.keys(item.value.value).filter((k) =>
          k.includes("media_")
        );
        return keys
          .map((key) => {
            const url = item.value.value[key]?.url;
            if (!url) return null;

            return prisma.media.upsert({
              where: {
                menuId_type_langCode: {
                  menuId: langArray[0].value.value.id,
                  type: key,
                  langCode: item.value.lang,
                },
              },
              update: {
                url,
                title: item.value.value.title,
                alt: item.value.value.title,
                updateBy: userToken.email ?? "system",
                updatedAt: new Date(),
                isDeleted: false,
                isActive: true,
              },
              create: {
                menuId: langArray[0].value.value.id,
                url,
                type: key,
                langCode: item.value.lang,
                title: item.value.value.title,
                alt: item.value.value.title,
                createBy: userToken.email ?? "system",
                createdAt: new Date(),
                isActive: true,
                isDeleted: false,
                companyId: userToken.companyId ?? null,
              },
            });
          })
          .filter(Boolean); // buang null
      });

      // Gabungkan semua query dalam satu transaksi
      await prisma.$transaction([...menuTranslationUpserts, ...mediaUpserts]);

      return { success: "Menu updated", data: {} };
    } else {
      const newMenu = await prisma.menu.create({
        data: {
          parentId: langArray[0].value.value.parent.value ?? null,
          sort: langArray[0].value.value.sort ?? 0,
          order: langArray[0].value.value.order ?? 0,
          isActive: langArray[0].value.value.isActive ?? true,
          typeMenuId: langArray[0].value?.value?.typeMenuId?.value ?? null,
          createBy: userToken.email ?? "system",
          createdAt: new Date(),
          publishAt: toPrismaDateTime(langArray[0].value.value.publishAt),
          companyId: userToken.companyId ?? null,
          translations: {
            create: langArray.map((item: any) => ({
              langCode: item.value.lang,
              title: item.value.value.title,
              slug: item.value.value.slug ?? "",
              linkType: item.value.value.linkType?.value ?? "URL",
              pageId: item.value.value.pageId?.value ?? null,
              categoryId: item.value.value.categoryId?.value ?? null,
              subTitle: item.value.value.subTitle ?? null,
              description: item.value.value.description ?? null,
              overview: item.value.value.overview ?? null,
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            })),
          },
          medias: {
            create: langArray.flatMap((item: any) =>
              Object.keys(item.value.value)
                .filter(
                  (key) => key.includes("media_") && item.value.value[key]?.url
                )
                .map((key) => ({
                  url: item.value.value[key].url,
                  title: item.value.value.title,
                  alt: item.value.value.title,
                  type: key,
                  langCode: item.value.lang,
                  createBy: userToken.email ?? "system",
                  isActive: true,
                  isDeleted: false,
                  companyId: userToken.companyId ?? null,
                }))
            ),
          },
        },
      });
      return { success: "Menu created", data: newMenu };
    }
  } catch (error) {
    console.log("error", error);
    return { error: "Field tidak lengkap" };
  }
}
