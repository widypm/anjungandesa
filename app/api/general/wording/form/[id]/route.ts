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
import { z, ZodError } from "zod";
import { generateZodSchema, validateWithZod } from "app/lib/zodValidasi";
import { Prisma } from "@prisma/client";
import { generateWordings } from "app/lib/controller/generateWording";
export const dynamic = "force-dynamic";
async function getForm(id: number) {
  // Ambil daftar bahasa aktif
  const langDat = await prisma.lang.findMany({
    where: { isActive: true },
    orderBy: { code: "desc" },
  });

  let query = null;
  if (id > 0) {
    query = await prisma.wordingGeneral.findUnique({
      where: { id },
      include: {
        WordingPage: true,
      },
    });

    if (!query || query.isDeleted) {
      return new NextResponse(ResponseHttp(404, "Data Not Found"), {
        status: 404,
      });
    }
  }

  // Map data terjemahan
  const translationMap = (query?.WordingPage || []).reduce((acc, curr) => {
    acc[curr.langCode.toUpperCase()] = curr;
    return acc;
  }, {} as Record<string, any>);

  const langs = langDat.map((lang) => {
    const langCode = lang.code.toUpperCase();
    const trans = translationMap[langCode] || {};

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
            name: "key",
            label: "Key",
            type: "text",
            value: trans?.key ?? "",
            allLang: true,
            required: true,
          },
          {
            name: "label",
            label: "Label",
            type: "text",
            value: trans?.label ?? "",
          },
        ],
      },
      {
        title: "Security",
        fields: [
          {
            name: "isActive",
            label: "Active",
            type: "switch",
            value: query?.isActive ?? true,
            allLang: true,
          },
        ],
      },
    ];

    return { name: langCode, data: steps };
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
      title: "Form Wording/Bahasa",
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
        // ✅ 1. Validasi page utama
        const parsedPage: any = {
          key: mainPage.key,
          isActive: mainPage.isActive,
          updateBy: userToken.email ?? "system",
          updatedAt: new Date(),
          companyId: userToken.companyId ?? null,
        };

        let valid = validateWithZod(schema, parsedPage);
        if (!valid.success) {
          return { error: valid.error };
        }
        // ✅ 2. Validasi tiap wording page
        const wordingPages = langArray.map((item) => ({
          wordingGeneralId: pageId,
          langCode: item?.value?.lang,
          key: item?.value?.value?.key,
          label: item?.value?.value?.label ?? "",
          createBy: userToken.email ?? "system",
          createdAt: new Date(),
          companyId: userToken.companyId ?? null,
        }));
        valid = validateWithZod(schema, wordingPages);
        if (!valid.success) {
          return { error: valid.error };
        }
        // ✅ 3. Eksekusi transaksi prisma
        await prisma.$transaction([
          prisma.wordingGeneral.update({
            where: { id: pageId },
            data: parsedPage,
          }),
          prisma.wordingPage.deleteMany({
            where: { pageId },
          }),
          ...wordingPages.map((data) => prisma.wordingPage.create({ data })),
        ]);

        await generateWordings(userToken.companyId);

        return { success: "Page updated" };
      } catch (error) {
        // console.log("error", error);
        if (error instanceof ZodError) {
          const joinedMessage = Object.values(error.flatten().fieldErrors)
            .flat()
            .filter(Boolean) // buang yang null/undefined
            .join(", ");
          return {
            error: joinedMessage,
          };
        }
        return { error: "Update page failed", details: error };
      }
    } else {
      try {
        const parsed: any = {
          key: langArray[0].value.value.key,
          isActive: langArray[0].value.value.isActive ?? true,
          createBy: userToken.email ?? "system",
          createdAt: new Date(),
          companyId: userToken.companyId ?? null,
          WordingPage: {
            create: langArray.map((item: any) => ({
              langCode: item.value.lang,
              key: item.value.value.key,
              label: item.value.value.label ?? "",
              createBy: userToken.email ?? "system",
              createdAt: new Date(),
              companyId: userToken.companyId ?? null,
            })),
          },
        };
        let valid = validateWithZod(schema, parsed);
        if (!valid.success) {
          return { error: valid.error };
        }
        const newMenu = await prisma.wordingGeneral.create({
          data: parsed,
        });
        await generateWordings(userToken.companyId);

        return { success: "Wording created", data: newMenu };
      } catch (error) {
        if (error instanceof ZodError) {
          const messages = error.issues
            .map((issue) => issue.message)
            .join(", ");
          return { error: messages }; // jadi string gabungan
        } else {
          return { error: "Field tidak lengkap" };
        }
      }
    }
  } catch (error) {
    console.log("error", error);
    return { error: "Field tidak lengkap" };
  }
}
