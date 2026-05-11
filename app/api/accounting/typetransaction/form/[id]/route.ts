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
import { wordingTr } from "app/lib/translationWording";
import { generateZodSchema, validateWithZod } from "app/lib/zodValidasi";
import { useActionState } from "react";
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";
async function getForm(id: string, userToken: any) {
  // example get langs array
  const langDat = await prisma.lang.findMany({
    where: { isActive: true, code: "ID" },
    orderBy: {
      code: "desc", // atau 'desc' jika ingin urutan menurun
    },
  });
  // Misalnya kita ambil user pertama (atau dari token, params, dll)
  let query = null;
  if (id != "0") {
    query = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: { include: { account: true } },
      },
    });
    if (!query || query.isDeleted) {
      return new NextResponse(ResponseHttp(404, "Data Not Found"), {
        status: 404,
      });
    }
  }
  // Form step
  const langs = langDat.map((lang) => {
    const langCode = lang.code.toUpperCase();

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
            name: "name",
            label: wordingTr(userToken.langCode ?? "ID", "name"),
            info: wordingTr(userToken.langCode ?? "ID", "info_date_journal"),
            type: "date",
            value: query?.date ?? "",
            // required: true,
            cols: "col-span-4",
          },
          {
            name: "debitAccount",
            label: wordingTr(userToken.langCode ?? "ID", "reference_no"),
            info: wordingTr(
              userToken.langCode ?? "ID",
              "info_reference_no_journal"
            ),
            type: "text",
            value: query?.reference ?? "",

            cols: "col-span-4",
          },
          {
            name: "creditAccount",
            label: wordingTr(userToken.langCode ?? "ID", "description"),
            info: wordingTr(
              userToken.langCode ?? "ID",
              "info_description_journal"
            ),
            type: "text",
            value: query?.description ?? "",

            cols: "col-span-4",
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
    const userToken = await verifyAndParseToken(req);
    const id = params.id;
    const langs = await getForm(id, userToken);

    //default json text
    const respon = ResponseHttp(200, "Success Login", {
      title: wordingTr(userToken.langCode ?? "ID", "form_coa"),
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
  const initForm = await getForm("0", userToken);
  const schema = generateZodSchema(initForm[0].data);
  //console.log("test", langArray);
  if (!Array.isArray(langArray)) {
    return { error: "Field tidak lengkap" };
  }

  try {
    // console.log("=== DEBUG START ===");
    // console.log("langArray =", JSON.stringify(langArray, null, 2));
    // console.log("id =", langArray[0]?.value?.value?.id);
    // console.log("=== DEBUG END ===");
    if (langArray[0]?.value?.id) {
      const updateData: Prisma.TypeTransactionUpdateInput = {
        name: langArray[0].value.name,
        debitAccount: {
          connect: { id: langArray[0].value.debitAccountId?.value },
        },
        creditAccount: {
          connect: { id: langArray[0].value.creditAccountId?.value },
        },
        updateBy: userToken.email ?? "system",
        updatedAt: new Date(),
      };
      const valid = validateWithZod(schema, updateData);
      if (!valid.success) {
        return { error: valid.error };
      }
      await prisma.typeTransaction.update({
        where: { id: langArray[0]?.value?.id },
        data: updateData,
      });
      return { success: "Type Transaction updated", data: {} };
    } else {
      const createData: Prisma.TypeTransactionCreateInput = {
        name: langArray[0].value.name,
        debitAccount: {
          connect: { id: langArray[0].value.debitAccountId?.value },
        },
        creditAccount: {
          connect: { id: langArray[0].value.creditAccountId?.value },
        },
        createBy: userToken.email ?? "system",
        createdAt: new Date(),
        company: {
          connect: { id: userToken.companyId },
        },
      };
      console.log("inputVal", createData);
      const valid = validateWithZod(schema, createData);
      if (!valid.success) {
        return { error: valid.error };
      }
      // Validasi balance dulu

      const newMenu = await prisma.typeTransaction.create({
        data: createData,
      });
      return { success: "Type Transaction created", data: newMenu };
    }
  } catch (error) {
    console.log("error", error);
    return { error: "Something Worng..." };
  }
}
