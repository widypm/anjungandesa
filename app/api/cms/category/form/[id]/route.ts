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
export const dynamic = "force-dynamic";
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const catPost = Number(searchParams.get("catpost") || 0); // default sorting
    const id = parseInt(params.id);
    const langDat = await prisma.lang.findMany({
      where: { isActive: true },
      orderBy: {
        code: "desc", // atau 'desc' jika ingin urutan menurun
      },
    });
    //klo post category
    if (catPost > 0) {
      const catPostData = await prisma.category.findFirst({
        where: {
          id: catPost,
        },
        include: {
          pageTranslations: {
            where: {
              langCode: "ID",
            },
          },
        },
      });
      try {
        // Misalnya kita ambil user pertama (atau dari token, params, dll)
        let query = null;
        if (id > 0) {
          query = await prisma.page.findUnique({
            where: { id },
            include: {
              translations: true,
              pageCategories: {
                include: {
                  categories: { include: { pageTranslations: true } },
                },
              },
              sectionsAsMain: {
                include: {
                  template: true,
                  page: { include: { translations: true } },
                  category: { include: { pageTranslations: true } },
                },
              },
              mediaPages: true,
            },
          });

          if (!query || query.isDeleted) {
            return new NextResponse(ResponseHttp(404, "Data Not Found"), {
              status: 404,
            });
          }
        }
        // Form step
        const translationMap = (query?.translations || []).reduce(
          (acc, curr) => {
            acc[curr.langCode.toUpperCase()] = curr;
            return acc;
          },
          {} as Record<string, any>
        );
        const sectionMap = (query?.sections || []).reduce((acc, curr) => {
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
          // console.log("ngaco", sec);
          const steps: Step[] = [
            {
              title: "Post Data",
              fields: [
                {
                  name: "id",
                  label: "id",
                  type: "hide",
                  value: query?.id ?? "",
                  allLang: true,
                },
                {
                  name: "catpost",
                  label: "catpost",
                  type: "hide",
                  value: true,
                  allLang: true,
                },
                {
                  name: "title",
                  label: "Title",
                  type: "text",
                  value: trans?.title ?? "",
                  sameValue: [
                    "slug",
                    "metaTitle",
                    "ogTitle",
                    "metaKeyword",
                    "metaDescription",
                  ],
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
                  cols: "col-span-12",
                },
                {
                  name: "overview",
                  label: "Overview",
                  type: "text-editor",
                  value: trans?.overview ?? "",
                  cols: "col-span-6",
                },
                // {
                //   name: "description",
                //   label: "Description",
                //   type: "text-editor",
                //   cols: "col-span-6",
                //   value: trans?.description ?? "",
                // },
              ],
            },
            {
              title: "Category",
              fields: [
                {
                  name: "category",
                  label: "Add Category",
                  type: "addRowCard",
                  allLang: true,
                  value: query?.pageCategories?.length
                    ? query?.pageCategories
                        ?.filter(
                          (rw) =>
                            rw.langCode?.toLowerCase() ===
                            langCode?.toLowerCase()
                        )
                        ?.map((rw) => ({
                          categoryId: rw.categoryId
                            ? {
                                value: rw.categoryId,
                                label:
                                  rw.categories?.pageTranslations?.[0].title ??
                                  "",
                              }
                            : null,
                        }))
                    : catPost > 0
                    ? [
                        {
                          categoryId: {
                            value: catPost,
                            label: catPostData.pageTranslations[0].title,
                          },
                        },
                      ]
                    : [],

                  fieldAddRow: [
                    {
                      name: "categoryId",
                      label: "Category",
                      type: "select-single",
                      cols: "col-span-12",
                      uriSelect: "api/cms/category/master",
                      allLang: true,
                    },
                  ],
                  cols: "col-span-12",
                },
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
                        type: rw.type
                          ? { value: rw.type, label: rw.type }
                          : null,
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
                    (item) =>
                      item.type === "media_icon" && item.langCode === langCode
                  ),
                },
                {
                  name: "media_thumbnail",
                  label: "Thumbnail",
                  type: "upload-fm",
                  value: query?.mediaPages.find(
                    (item) =>
                      item.type === "media_thumbnail" &&
                      item.langCode === langCode
                  ),
                },
                {
                  name: "media_imagePhone",
                  label: "Image Phone",
                  type: "upload-fm",
                  value: query?.mediaPages.find(
                    (item) =>
                      item.type === "media_imagePhone" &&
                      item.langCode === langCode
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
                  value: { url: trans.ogImage?.url },
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
          title: "Form Post",
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
        const rsp = ResponseHttp(500, "Application Maintenace", "", error);
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
        let query = null;
        // console.log("masuk", id);
        if (id > 0) {
          query = await prisma.category.findUnique({
            where: { id },
            include: {
              pageTranslations: true,
              medias: true,
            },
          });
          // console.log("masuk", query);
          if (!query || query.isDeleted) {
            return new NextResponse(ResponseHttp(404, "Data Not Found"), {
              status: 404,
            });
          }
        }
        // Form step
        const translationMap = (query?.pageTranslations || []).reduce(
          (acc, curr) => {
            acc[curr.langCode.toUpperCase()] = curr;
            return acc;
          },
          {} as Record<string, any>
        );
        const langs = langDat.map((lang) => {
          const langCode = lang.code.toUpperCase();
          const trans = translationMap[langCode] || {};

          const steps: Step[] = [
            {
              title: "Category ",
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
                  label: "Title Menu",
                  type: "text",
                  value: trans?.title ?? "",
                  sameValue: ["slug"],
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
                  cols: "col-span-12",
                },
                {
                  name: "overview",
                  label: "Overview",
                  type: "text-editor",
                  value: trans?.overview ?? "",
                  cols: "col-span-6",
                },
                // {
                //   name: "description",
                //   label: "Description",
                //   type: "text-editor",
                //   cols: "col-span-6",
                //   value: trans?.description ?? "",
                // },
              ],
            },
            {
              title: "Media",
              fields: [
                {
                  name: "media_image",
                  label: "Image Default",
                  type: "upload-fm",
                  value: query?.mediaPages?.find(
                    (item) =>
                      item.type === "media_image" && item.langCode === langCode
                  ),
                },
                {
                  name: "media_icon",
                  label: "Icon",
                  type: "upload-fm",
                  value: query?.mediaPages?.find(
                    (item) =>
                      item.type === "media_icon" && item.langCode === langCode
                  ),
                },
                {
                  name: "media_thumbnail",
                  label: "Thumbnail",
                  type: "upload-fm",
                  value: query?.mediaPages?.find(
                    (item) =>
                      item.type === "media_thumbnail" &&
                      item.langCode === langCode
                  ),
                },
                {
                  name: "media_imagePhone",
                  label: "Image Phone",
                  type: "upload-fm",
                  value: query?.mediaPages?.find(
                    (item) =>
                      item.type === "media_imagePhone" &&
                      item.langCode === langCode
                  ),
                },
                {
                  name: "media_banner",
                  label: "Banner",
                  type: "upload-fm",
                  value: query?.mediaPages?.find(
                    (item) =>
                      item.type === "media_banner" && item.langCode === langCode
                  ),
                },
              ],
            },
            // {
            //   title: "Meta Data",
            //   fields: [
            //     {
            //       name: "metaTitle",
            //       label: "Meta Title",
            //       type: "text",
            //       cols: "col-span-6",
            //     },
            //     {
            //       name: "metaDescription",
            //       label: "Meta Description",
            //       type: "textarea",
            //       cols: "col-span-6",
            //       sameValue: ["ogDescription"],
            //     },
            //     {
            //       name: "metaKeywords",
            //       label: "Meta Keywords",
            //       type: "text",
            //       cols: "col-span-6",
            //     },
            //     {
            //       name: "ogTitle",
            //       label: "OG Title",
            //       type: "text",
            //       cols: "col-span-6",
            //     },
            //     {
            //       name: "ogDescription",
            //       label: "OG Description",
            //       type: "textarea",
            //       cols: "col-span-6",
            //     },
            //     {
            //       name: "ogImage",
            //       label: "OG Image URL",
            //       type: "text", // atau file jika pakai file manager
            //       cols: "col-span-6",
            //     },
            //     {
            //       name: "ogType",
            //       label: "OG Type",
            //       type: "text", // atau bisa pakai select jika perlu opsi tetap seperti 'website', 'article'
            //       cols: "col-span-6",
            //     },
            //     {
            //       name: "canonicalUrl",
            //       label: "Canonical URL",
            //       type: "text",
            //       cols: "col-span-6",
            //     },
            //   ],
            // },
            {
              title: "Security",
              fields: [
                {
                  name: "publishAt",
                  label: "Publish Date",
                  type: "datetime-local",
                  value: trans?.publishAt ?? "",
                  allLang: true,
                },
                {
                  name: "unPublishAt",
                  label: "UnPublish Date",
                  type: "datetime-local",
                  value: trans?.publishAt ?? "",
                  allLang: true,
                },
                {
                  name: "isActive",
                  label: "Active",
                  type: "switch",
                  value: trans?.isActive ?? false,
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
          title: "Form Category",
          data: langs,
          isPoint: true,
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
  } catch (error) {
    console.log("[Role Create-form error]", error);
    const rsp = ResponseHttp(500, "Application Maintenace", "", error);
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
    const respon = ResponseHttp(500, "Internal Server Error", {}, error);
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
    const respon = ResponseHttp(500, "Internal Server Error", {}, error);
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
  if (!Array.isArray(langArray)) {
    return { error: "Field tidak lengkap" };
  }
  try {
    if (pageId) {
      // Loop dan jalankan manual upsert untuk translation dan media
      if (mainPage.catpost) {
        // console.log("📌 Update Page ID:", pageId);
        try {
          // ✅ 1. Update page utama
          await prisma.page.update({
            where: { id: pageId },
            data: {
              sort: mainPage.sort ?? 0,
              order: mainPage.order ?? 0,
              isActive: mainPage.isActive ?? true,
              publishAt: toPrismaDateTime(mainPage.publishAt),
              unPublishAt: toPrismaDateTime(mainPage.unPublishAt),
              updateBy: userToken.email ?? "system",
              updatedAt: new Date(),
              companyId: userToken.companyId ?? null,
            },
          });

          // ✅ 2. Upsert page translation
          const menuTranslationUpserts = langArray
            .map((item) => {
              const value = item?.value?.value;
              const langCode = item?.value?.lang;

              if (!value?.id || !langCode) return null;

              return prisma.pageTranslation.upsert({
                where: {
                  pageId_langCode: {
                    pageId: value.id,
                    langCode,
                  },
                },
                update: {
                  title: value.title,
                  slug: value.slug.toLowerCase() ?? "",
                  subTitle: value.subTitle ?? null,
                  description: cleanContent(value.description ?? ""),
                  overview: cleanContent(value.overview ?? ""),
                  canonicalUrl: value.canonicalUrl ?? null,
                  metaDescription: value.metaDescription ?? null,
                  metaKeywords: value.metaKeywords ?? null,
                  metaTitle: value.metaTitle ?? null,
                  ogDescription: value.ogDescription ?? null,
                  ogImage: value.ogImage?.url ?? null,
                  ogTitle: value.ogTitle ?? null,
                  ogType: value.ogType ?? null,
                  updateBy: userToken.email ?? "system",
                  updatedAt: new Date(),
                  companyId: userToken.companyId ?? null,
                },
                create: {
                  pageId: value.id,
                  langCode,
                  title: value.title,
                  slug: value.slug.toLowerCase() ?? "",
                  subTitle: value.subTitle ?? null,
                  description: cleanContent(value.description ?? ""),
                  overview: cleanContent(value.overview ?? ""),
                  canonicalUrl: value.canonicalUrl ?? null,
                  metaDescription: value.metaDescription ?? null,
                  metaKeywords: value.metaKeywords ?? null,
                  metaTitle: value.metaTitle ?? null,
                  ogDescription: value.ogDescription ?? null,
                  ogImage: value.ogImage?.url ?? null,
                  ogTitle: value.ogTitle ?? null,
                  ogType: value.ogType ?? null,
                  createBy: userToken.email ?? "system",
                  createdAt: new Date(),
                  companyId: userToken.companyId ?? null,
                },
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

                return prisma.mediaPage.upsert({
                  where: {
                    pageId_type_langCode: {
                      pageId,
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
                    companyId: userToken.companyId ?? null,
                  },
                  create: {
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
                  },
                });
              })
              .filter(Boolean);
          });

          // ✅ 4. Section ops
          const categoryQs = langArray.flatMap((item, i) => {
            const cat = item?.value?.value?.category;
            if (!cat || !Array.isArray(cat)) return [];

            return cat.map((section) =>
              prisma.pageCategory.create({
                data: {
                  pageId,
                  categoryId: section?.categoryId?.value ?? null,
                  langCode: item.value.lang,
                },
              })
            );
          });

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

              return prisma.section.create({
                data: {
                  pageId: pageId,
                  langCode,
                  type: type?.value,
                  title: title ?? null,
                  subTitle: subTitle ?? null,
                  description: cleanContent(description ?? ""),
                  overview: null,
                  image: image?.url ?? null,
                  secondImage: secondImage?.url ?? null,
                  isActive: true,
                  isDeleted: false,
                  createBy: userToken.email ?? "system",
                  createdAt: new Date(),
                  order: isec,
                  templateId: templateId?.value,
                  categoryId: categoryId?.value ?? null,
                  pageIdData: pageIdData?.value ?? null,
                  companyId: userToken.companyId ?? null,
                },
              });
            });
          });

          // ✅ 5. Transaksi gabungan
          await prisma.$transaction([
            prisma.pageCategory.deleteMany({
              where: { pageId },
            }),
            ...categoryQs,
            prisma.section.deleteMany({
              where: { pageId },
            }),
            ...sectionOps,
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
        await prisma.category.update({
          where: { id: mainPage.id },
          data: {
            isActive: mainPage.isActive ?? true,
            updateBy: userToken.email ?? "system",
            updatedAt: new Date(),
          },
        });

        const menuTranslationUpserts = langArray.map(async (item) => {
          const lang = item.value.lang;
          const data = item.value.value;
          const now = new Date();

          const existing = await prisma.pageTranslation.findFirst({
            where: {
              AND: [{ langCode: lang }, { categoryId: data.id }],
            },
          });

          if (existing) {
            return prisma.pageTranslation.update({
              where: { id: existing.id },
              data: {
                title: data.title,
                slug: data.slug ?? "",
                subTitle: data.subTitle ?? null,
                description: cleanContent(data.description ?? ""),
                overview: cleanContent(data.overview ?? ""),
                metaTitle: data.metaTitle ?? null,
                metaDescription: data.metaDescription ?? null,
                metaKeywords: data.metaKeywords ?? null,
                ogTitle: data.ogTitle ?? null,
                ogDescription: data.ogDescription ?? null,
                ogImage: data.ogImage ?? null,
                ogType: data.ogType ?? null,
                canonicalUrl: data.canonicalUrl ?? null,
                updateBy: userToken.email ?? "system",
                updatedAt: now,
              },
            });
          } else {
            return prisma.pageTranslation.create({
              data: {
                pageId: data.pageId ?? null,
                categoryId: data.categoryId ?? null,
                langCode: lang,
                title: data.title,
                slug: data.slug ?? "",
                subTitle: data.subTitle ?? null,
                description: cleanContent(data.description ?? ""),
                overview: cleanContent(data.overview ?? ""),
                metaTitle: data.metaTitle ?? null,
                metaDescription: data.metaDescription ?? null,
                metaKeywords: data.metaKeywords ?? null,
                ogTitle: data.ogTitle ?? null,
                ogDescription: data.ogDescription ?? null,
                ogImage: data.ogImage ?? null,
                ogType: data.ogType ?? null,
                canonicalUrl: data.canonicalUrl ?? null,
                createBy: userToken.email ?? "system",
                createdAt: now,
                isActive: true,
                isDeleted: false,
              },
            });
          }
        });

        // jangan lupa tunggu semua promise
        await Promise.all(menuTranslationUpserts);

        const mediaUpserts = await Promise.all(
          langArray.flatMap((item) => {
            const keys = Object.keys(item.value.value).filter((k) =>
              k.includes("media_")
            );

            return keys.map(async (key) => {
              const url = item.value.value[key]?.url;
              if (!url) return null;
              const existing = await prisma.mediaPage.findFirst({
                where: {
                  categoryId: langArray[0].value.value.id,
                  type: key,
                  langCode: item.value.lang,
                },
              });

              if (existing) {
                return prisma.mediaPage.update({
                  where: { id: existing.id },
                  data: {
                    url,
                    title: item.value.value.title,
                    alt: item.value.value.title,
                    updateBy: userToken.email ?? "system",
                    updatedAt: new Date(),
                    isDeleted: false,
                    isActive: true,
                  },
                });
              } else {
                return prisma.mediaPage.create({
                  data: {
                    pageId: langArray[0].value.value.id,
                    url,
                    type: key,
                    langCode: item.value.lang,
                    title: item.value.value.title,
                    alt: item.value.value.title,
                    createBy: userToken.email ?? "system",
                    createdAt: new Date(),
                    isActive: true,
                    isDeleted: false,
                  },
                });
              }
            });
          })
        );

        return { success: "Menu updated", data: {} };
      }
    } else {
      if (mainPage?.catpost) {
        const newMenu = await prisma.page.create({
          data: {
            sort: langArray[0].value.value.sort ?? 0,
            order: langArray[0].value.value.order ?? 0,
            isActive: langArray[0].value.value.isActive ?? true,
            createBy: userToken.email ?? "system",
            createdAt: new Date(),
            publishAt: toPrismaDateTime(langArray[0].value.value.publishAt),
            unPublishAt: toPrismaDateTime(langArray[0].value.value.unPublishAt),
            pageType: "POST",
            companyId: userToken.companyId ?? null,
            translations: {
              create: langArray.map((item: any) => ({
                langCode: item.value.lang,
                title: item.value.value.title,
                slug: item.value.value.slug.toLowerCase() ?? "",
                subTitle: item.value.value.subTitle ?? null,
                overview: cleanContent(item.value.value.overview ?? ""),
                description: cleanContent(item.value.value.description ?? ""),
                canonicalUrl: item.value.value.canonicalUrl ?? null,
                metaDescription: item.value.value.metaDescription ?? null,
                metaKeywords: item.value.value.metaKeywords ?? null,
                metaTitle: item.value.value.metaTitle ?? null,
                ogDescription: item.value.value.ogDescription ?? null,
                ogImage: item.value.value.ogImage?.url ?? null,
                ogTitle: item.value.value.ogTitle ?? null,
                ogType: item.value.value.ogType ?? null,
                createBy: userToken.email ?? "system",
                createdAt: new Date(),
                companyId: userToken.companyId ?? null,
              })),
            },
            mediaPages: {
              create: langArray.flatMap((item: any) =>
                Object.keys(item.value.value)
                  .filter(
                    (key) =>
                      key.includes("media_") && item.value.value[key]?.url
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
            pageCategories: {
              create: langArray.flatMap((item: any) =>
                (item.value.value.category ?? []).map((cat: any) => ({
                  categoryId: cat.categoryId?.value ?? null,
                  langCode: item.value.lang,
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
                  type: section.type?.value,
                  order: section.order ?? 0,
                  description: cleanContent(section.description) ?? null,
                  image: section.image?.url ?? null,
                  secondImage: section.secondImage ?? null,
                  isActive: section.isActive ?? true,
                  isDeleted: false,
                  createBy: userToken.email ?? "system",
                  createdAt: new Date(),
                  companyId: userToken.companyId ?? null,
                }))
              ),
            },
          },
        });

        return { success: "Page created", data: newMenu };
      } else {
        const newMenu = await prisma.category.create({
          data: {
            isActive: langArray[0].value.value.isActive ?? true,
            createBy: userToken.email ?? "system",
            createdAt: new Date(),
            companyId: userToken.companyId ?? null,
            pageTranslations: {
              create: langArray.map((item: any) => ({
                langCode: item.value.lang,
                title: item.value.value.title,
                slug: item.value.value.slug.toLowerCase() ?? "",
                subTitle: item.value.value.subTitle ?? null,
                description: cleanContent(item.value.value.description ?? ""),
                overview: cleanContent(item.value.value.overview ?? ""),
                createBy: userToken.email ?? "system",
                createdAt: new Date(),
                companyId: userToken.companyId ?? null,
              })),
            },
            medias: {
              create: langArray.flatMap((item: any) =>
                Object.keys(item.value.value)
                  .filter(
                    (key) =>
                      key.includes("media_") && item.value.value[key]?.url
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
    }
  } catch (error) {
    console.log("error", error);
    return { error: "Field tidak lengkap" };
  }
}
