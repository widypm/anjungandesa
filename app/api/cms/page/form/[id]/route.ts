import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../../lib/response";
import { Step } from "../../../../../types";
import {
  cleanContent,
  GetDecrypt,
  toPrismaDateTime,
} from "../../../../../lib/helper";
import { verifyAndParseToken } from "../../../../../lib/jwtParse";
import { url } from "inspector";
import { generateZodSchema, validateWithZod } from "app/lib/zodValidasi";
import { fa } from "zod/v4/locales/index.cjs";
import { title } from "process";
export const dynamic = "force-dynamic";
async function getForm(id: number) {
  const langDat = await prisma.lang.findMany({
    where: { isActive: true },
    orderBy: {
      code: "desc", // atau 'desc' jika ingin urutan menurun
    },
  });
  // Misalnya kita ambil user pertama (atau dari token, params, dll)
  let query = null;
  if (id > 0) {
    query = await prisma.page.findUnique({
      where: { id },
      include: {
        translations: true,
        mediaPages: true,
        sectionsAsMain: {
          include: {
            template: true,
            page: { include: { translations: true } },
            category: { include: { pageTranslations: true } },
          },
        },
        wording: true,
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
    const sec = query?.sectionsAsMain
      ?.filter((section) => section.langCode === langCode)
      ?.map((section) => ({
        ...section,
        idLangData: section, // di sini udah pasti langCode match
      }));
    const words = query?.wording
      ?.filter((word) => word.langCode === langCode)
      ?.map((word) => ({
        ...word,
        idLangData: word, // di sini udah pasti langCode match
      }));

    const steps: Step[] = [
      {
        title: "Page Data",
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
            label: "Title ",
            type: "text",
            value: trans?.title ?? "",
            sameValue: [
              "slug",
              "metaTitle",
              "ogTitle",
              "metaKeyword",
              "metaDescription",
            ],
            required: true,
          },
          {
            name: "subTitle",
            label: "Sub Title",
            type: "text",
            value: trans?.subTitle ?? "",
          },
          {
            name: "slug",
            label: "Slug",
            type: "text",
            value: trans?.slug ?? "",
            replaceValue: { from: " ", to: "-" },
            required: true,
          },
          {
            name: "overview",
            label: "Overview",
            type: "text-editor",
            value: trans?.overview ?? "",
            cols: "col-span-12",
          },
          // {
          //   name: "description",
          //   label: "Description",
          //   type: "text-editor",
          //   cols: "col-span-12",
          //   value: trans?.description ?? "",
          // },
        ],
      },
      {
        title: "Section",
        fields: [
          {
            name: "sections",
            label: "Add Section",
            type: "addRowCard",
            allLang: true,
            value: sec
              ? sec.map((rw, i) => ({
                  templateId: rw.template?.id
                    ? {
                        value: rw.template.id,
                        label: rw.template.name ?? "",
                      }
                    : null,
                  type: rw.type ? { value: rw.type, label: rw.type } : null,
                  categoryId: rw?.category?.id
                    ? {
                        value: rw.category.id,
                        label:
                          rw.category.pageTranslations?.find(
                            (p) => p.langCode === langCode
                          )?.title ?? "",
                      }
                    : null,
                  pageIdData: rw?.page?.id
                    ? {
                        value: rw.page.id,
                        label:
                          rw.page.translations?.find(
                            (p) => p.langCode === langCode
                          )?.title ?? "",
                      }
                    : null,
                  title: rw.title ?? "",
                  subTitle: rw?.subTitle ?? "",
                  description: rw?.description ?? "",
                  image: { url: rw?.image },
                  isActive: rw?.isActive,
                  secondImage: { url: rw?.secondImage },
                }))
              : [],

            fieldAddRow: [
              {
                name: "templateId",
                label: "Template",
                type: "select-single",
                cols: "col-span-6",
                uriSelect: "api/cms/template/master",
                allLang: true,
              },
              {
                name: "type",
                label: "Type Section",
                type: "select-single",
                cols: "col-span-6",
                uriSelect: "api/cms/typeSection/master",
                allLang: true,
              },
              {
                name: "categoryId",
                label: "Category",
                type: "select-single",
                cols: "col-span-6",
                uriSelect: "api/cms/category/master",
                allLang: true,
                hideFields: [
                  {
                    name: "type",
                    value: ["CONTENT", "PAGE"],
                  },
                ],
              },
              {
                name: "pageIdData",
                label: "Page",
                type: "select-single",
                cols: "col-span-6",
                uriSelect: "api/cms/page/master",
                allLang: true,
                hideFields: [
                  {
                    name: "type",
                    value: ["CONTENT", "CATEGORY"],
                  },
                ],
              },
              {
                name: "title",
                label: "Title",
                type: "text",
                cols: "col-span-6",

                hideFields: [
                  {
                    name: "type",
                    value: ["CATEGORY", "PAGE"],
                  },
                ],
              },
              {
                name: "subTitle",
                label: "Sub Title",
                type: "text",
                cols: "col-span-6",

                hideFields: [
                  {
                    name: "type",
                    value: ["CATEGORY", "PAGE"],
                  },
                ],
              },
              {
                name: "isActive",
                label: "Active",
                type: "switch",
                value: true,
                allLang: true,
              },
              {
                name: "description",
                label: "Description",
                type: "text-editor",
                cols: "col-span-12",

                hideFields: [
                  {
                    name: "type",
                    value: ["CATEGORY", "PAGE"],
                  },
                ],
              },
              {
                name: "image",
                label: "First Image/File",
                type: "upload-fm",
                cols: "col-span-6",

                hideFields: [
                  {
                    name: "type",
                    value: ["CATEGORY", "PAGE"],
                  },
                ],
              },
              {
                name: "Image",
                label: "Second Image/File",
                type: "upload-fm",
                cols: "col-span-6",

                hideFields: [
                  {
                    name: "type",
                    value: ["CATEGORY", "PAGE"],
                  },
                ],
              },
            ],
            cols: "col-span-12",
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
            value: query?.mediaPages.find(
              (item) =>
                item.type === "media_image" && item.langCode === langCode
            ),
          },
          {
            name: "media_icon",
            label: "Icon",
            type: "upload-fm",
            value: query?.mediaPages.find(
              (item) => item.type === "media_icon" && item.langCode === langCode
            ),
          },
          {
            name: "media_thumbnail",
            label: "Thumbnail",
            type: "upload-fm",
            value: query?.mediaPages.find(
              (item) =>
                item.type === "media_thumbnail" && item.langCode === langCode
            ),
          },
          {
            name: "media_imagePhone",
            label: "Image Phone",
            type: "upload-fm",
            value: query?.mediaPages.find(
              (item) =>
                item.type === "media_imagePhone" && item.langCode === langCode
            ),
          },
          {
            name: "media_banner",
            label: "Banner",
            type: "upload-fm",
            value: query?.mediaPages.find(
              (item) =>
                item.type === "media_banner" && item.langCode === langCode
            ),
          },
        ],
      },
      {
        title: "Meta Data",
        fields: [
          {
            name: "metaTitle",
            label: "Meta Title",
            type: "text",
            cols: "col-span-6",
            value: trans.metaTitle,
            required: true,
          },
          {
            name: "metaDescription",
            label: "Meta Description",
            type: "textarea",
            cols: "col-span-6",
            sameValue: ["ogDescription"],
            value: trans.metaDescription,
          },
          {
            name: "metaKeywords",
            label: "Meta Keywords",
            type: "text",
            cols: "col-span-6",
            value: trans.metaKeywords,
          },
          {
            name: "ogTitle",
            label: "OG Title",
            type: "text",
            cols: "col-span-6",
            value: trans.ogTitle,
          },
          {
            name: "ogDescription",
            label: "OG Description",
            type: "textarea",
            cols: "col-span-6",
            value: trans.ogDescription,
          },
          {
            name: "ogImage",
            label: "OG Image URL",
            type: "upload-fm", // atau file jika pakai file manager
            cols: "col-span-6",
            value: { url: trans.ogImage },
          },
          {
            name: "ogType",
            label: "OG Type",
            type: "text", // atau bisa pakai select jika perlu opsi tetap seperti 'website', 'article'
            cols: "col-span-6",
            value: trans.ogType,
          },
          {
            name: "canonicalUrl",
            label: "Canonical URL",
            type: "text",
            cols: "col-span-6",
            value: trans.canonicalUrl,
          },
        ],
      },
      {
        title: "Wording",
        fields: [
          {
            name: "wording",
            label: "Add Wording",
            type: "addRowTable",
            allLang: true,
            value: words
              ? words.map((rw, i) => ({
                  type: rw.key ?? "",
                  label: rw.title ?? "",
                }))
              : [],
            fieldAddRow: [
              {
                name: "key",
                label: "Key",
                type: "text",
                cols: "col-span-6",
                allLang: true,
              },
              {
                name: "label",
                label: "Label",
                type: "text",
                cols: "col-span-6",
              },
            ],
            cols: "col-span-12",
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
  return langs;
}
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    // example get langs array
    const langs = await getForm(id);
    //default json text
    const respon = ResponseHttp(200, "Success Login", {
      title: "Form Page",
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
  const mainPage = langArray[0]?.value?.value;
  const pageId = mainPage?.id;
  const initForm = await getForm(0);
  const schema = generateZodSchema(initForm[0].data);

  try {
    if (pageId) {
      console.log("📌 Update Page ID:", pageId);
      try {
        // ✅ 1. Update page utama
        const dataMpage = {
          sort: mainPage.sort ?? 0,
          order: mainPage.order ?? 0,
          isActive: mainPage.isActive ?? true,
          publishAt: toPrismaDateTime(mainPage.publishAt),
          unPublishAt: toPrismaDateTime(mainPage.unPublishAt),
          updateBy: userToken.email ?? "system",
          updatedAt: new Date(),
        };

        let valid = validateWithZod(schema, dataMpage);
        if (!valid.success) {
          return { error: valid.error };
        }
        // ✅ 2. Upsert page translation
        const menuTranslationUpserts = langArray
          .map((item) => {
            const value = item?.value?.value;
            const langCode = item?.value?.lang;

            if (!value?.id || !langCode) return null;
            const dataEd = {
              title: value.title,
              slug: value.slug.toLowerCase() ?? "",
              subTitle: value.subTitle ?? null,
              description: cleanContent(value.description ?? ""),
              overview: cleanContent(value.overview ?? ""),
              metaDescription: value.metaDescription ?? null,
              metaKeywords: value.metaKeywords ?? null,
              metaTitle: value.metaTitle ?? null,
              ogDescription: value.ogDescription ?? null,
              ogImage: value.ogImage?.url ?? null,
              ogTitle: value.ogTitle ?? null,
              ogType: value.ogType ?? null,
              updateBy: userToken.email ?? "system",
              updatedAt: new Date(),
            };
            const datacr = {
              pageId: value.id,
              langCode,
              title: value.title,
              slug: value.slug.toLowerCase() ?? "",
              subTitle: value.subTitle ?? null,
              description: cleanContent(value.description ?? ""),
              overview: cleanContent(value.overview ?? ""),
              metaDescription: value.metaDescription ?? null,
              metaKeywords: value.metaKeywords ?? null,
              metaTitle: value.metaTitle ?? null,
              canonicalUrl: item.value.value.canonicalUrl ?? null,
              ogDescription: value.ogDescription ?? null,
              ogImage: value.ogImage?.url ?? null,
              ogTitle: value.ogTitle ?? null,
              ogType: value.ogType ?? null,
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            };
            const valided = validateWithZod(schema, dataEd);
            const validcr = validateWithZod(schema, datacr);
            if (!valided.success) {
              throw new Error(valided.error);
            }
            if (!validcr.success) {
              throw new Error(validcr.error);
            }
            return prisma.pageTranslation.upsert({
              where: {
                pageId_langCode: {
                  pageId: value.id,
                  langCode,
                },
              },
              update: dataEd,
              create: datacr,
            });
          })
          .filter(Boolean);

        // ✅ 3. Upsert media per bahasa
        const mediaUpserts = langArray.flatMap((item) => {
          const keys = Object.keys(item?.value?.value || {}).filter((k) =>
            k.includes("media_")
          );

          return keys
            .map((key) => {
              const url = item.value.value[key]?.url;
              if (!url) return null;
              const dataEd = {
                url,
                title: item.value.value.title,
                alt: item.value.value.title,
                updateBy: userToken.email ?? "system",
                updatedAt: new Date(),
                isDeleted: false,
                isActive: true,
              };
              const datacr = {
                pageId,
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
              };
              const valided = validateWithZod(schema, dataEd);
              const validcr = validateWithZod(schema, datacr);
              if (!valided.success) {
                throw new Error(valided.error);
              }
              if (!validcr.success) {
                throw new Error(validcr.error);
              }
              return prisma.mediaPage.upsert({
                where: {
                  pageId_type_langCode: {
                    pageId,
                    type: key,
                    langCode: item.value.lang,
                  },
                },
                update: dataEd,
                create: datacr,
              });
            })
            .filter(Boolean);
        });

        // ✅ 4. Section ops
        const sectionOps = langArray.flatMap((item) => {
          const sections = item?.value?.value?.sections;
          const langCode = item?.value?.lang;

          if (!sections || !Array.isArray(sections)) return [];

          return sections.map((section, isec: number) => {
            const {
              title,
              subTitle,
              description,
              templateId,
              categoryId,
              pageIdData,
              type,
              image,
              secondImage,
            } = section;
            const datacr = {
              pageId: pageId,
              langCode,
              type: type?.value,
              title: title,
              subTitle: subTitle,
              description: cleanContent(description),
              overview: null,
              image: image?.url ?? null,
              secondImage: secondImage?.url ?? null,
              isActive: section.isActive ?? false,
              isDeleted: false,
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              order: isec,
              templateId: templateId?.value,
              categoryId: categoryId?.value ?? null,
              pageIdData: pageIdData?.value ?? null,
              companyId: userToken.companyId ?? null,
            };
            // const validcr = validateWithZod(schema, datacr);
            // if (!validcr.success) {
            //   throw new Error(validcr.error);
            // }
            return prisma.section.create({
              data: datacr,
            });
          });
        });
        const wording = langArray.flatMap((item) => {
          const wording = item?.value?.value?.wording;
          const langCode = item?.value?.lang;

          if (!wording || !Array.isArray(wording)) return [];

          return wording.map((section, isec: number) => {
            const { key, label } = section;
            const datacr = {
              pageId: pageId,
              langCode,
              key: key,
              label: label,
            };
            const validcr = validateWithZod(schema, datacr);
            if (!validcr.success) {
              throw new Error(validcr.error);
            }
            return prisma.wordingPage.create({
              data: datacr,
            });
          });
        });

        // ✅ 5. Transaksi gabungan
        await prisma.$transaction([
          prisma.page.update({
            where: { id: pageId },
            data: dataMpage,
          }),
          prisma.section.deleteMany({
            where: { pageId },
          }),
          prisma.wordingPage.deleteMany({
            where: { pageId },
          }),
          ...sectionOps,
          ...wording,
          ...menuTranslationUpserts,
          ...mediaUpserts,
        ]);

        console.log("✅ Semua data berhasil diupdate.");
        return { success: "Page updated", data: {} };
      } catch (error) {
        console.error("🔥 ERROR di proses update Page:", error);
        return { error: "Update page failed", details: error };
      }
    } else {
      const newMenu = await prisma.page.create({
        data: {
          sort: langArray[0].value.value.sort ?? 0,
          order: langArray[0].value.value.order ?? 0,
          isActive: langArray[0].value.value.isActive ?? true,
          createBy: userToken.email ?? "system",
          createdAt: new Date(),
          publishAt: toPrismaDateTime(langArray[0].value.value.publishAt),
          unPublishAt: toPrismaDateTime(langArray[0].value.value.unPublishAt),
          pageType: "PAGE",
          companyId: userToken.companyId ?? null,
          translations: {
            create: langArray.map((item: any) => ({
              langCode: item.value.lang,
              title: item.value.value.title,
              slug: item.value.value.slug.toLowerCase() ?? "",
              subTitle: item.value.value.subTitle ?? null,
              description: cleanContent(item.value.value.description ?? ""),
              metaDescription: item.value.value.metaDescription ?? null,
              metaKeywords: item.value.value.metaKeywords ?? null,
              metaTitle: item.value.value.metaTitle ?? null,
              ogDescription: item.value.value.ogDescription ?? null,
              canonicalUrl: item.value.value.canonicalUrl ?? null,
              ogImage: item?.value?.value?.ogImage?.url ?? null,
              ogTitle: item?.value?.value?.ogTitle ?? null,
              ogType: item.value.value.ogType ?? null,
              overview: cleanContent(item.value.value.overview) ?? null,
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            })),
          },
          mediaPages: {
            create: langArray.flatMap((item: any) =>
              Object.keys(item.value.value)
                .filter(
                  (key) => key.includes("media_") && item.value.value[key]?.url
                )
                .map((key) => ({
                  url: item.value.value[key]?.url ?? null,
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
          sectionsAsMain: {
            create: langArray.flatMap((item: any) =>
              (item.value.value.sections ?? []).map((section: any) => ({
                langCode: item.value.lang,
                pageIdData: section.pageIdData?.value ?? null,
                categoryId: section.categoryId?.value ?? null,
                templateId: section.templateId?.value,
                title: section?.title,
                subTitle: section?.subTitle,
                type: section.type?.value,
                order: section.order ?? 0,
                description: cleanContent(section.description) ?? null,
                image: section.image?.url ?? null,
                isActive: section.isActive ?? false,
                secondImage: section.secondImage ?? null,
                isDeleted: false,
                createBy: userToken.email ?? "system",
                createdAt: new Date(),
                companyId: userToken.companyId ?? null,
              }))
            ),
          },
          wording: {
            create: langArray.flatMap((item: any) =>
              (item.value.value.wording ?? []).map((section: any) => ({
                key: section.key,
                label: section.label,
                langCode: item.value.lang,
                companyId: userToken.companyId ?? null,
              }))
            ),
          },
        },
      });

      return { success: "Page created", data: newMenu };
    }
  } catch (error) {
    console.log("error", error);
    return { error: (error as Error).message };
  }
}
