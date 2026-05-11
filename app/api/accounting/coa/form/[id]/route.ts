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
import { CashFlowCategory } from "@prisma/client";
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
    query = await prisma.account.findUnique({
      where: { id },
      include: {
        parent: true,
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
            name: "code",
            label: wordingTr(userToken.langCode ?? "ID", "code"),
            info: wordingTr(userToken.langCode ?? "ID", "info_code_coa"),
            type: "text",
            value: query?.code ?? "",
            required: true,
          },
          {
            name: "name",
            label: wordingTr(userToken.langCode ?? "ID", "name"),
            info: wordingTr(userToken.langCode ?? "ID", "info_name_coa"),
            type: "text",
            value: query?.name ?? "",
            required: true,
          },
          {
            name: "cashFlowCategory",
            label: wordingTr(userToken.langCode ?? "ID", "cash_flow_category"),
            info: wordingTr(userToken.langCode ?? "ID", "info_cash_flow_coa"),
            type: "select-single",
            value: query?.type
              ? {
                  value: query?.cashFlowCategory,
                  label: query?.cashFlowCategory,
                }
              : null,
            uriSelect: "api/accounting/cashflowcategory/master",
            allLang: true,
            required: true,
          },
          {
            name: "type",
            label: wordingTr(userToken.langCode ?? "ID", "account_type"),
            info: wordingTr(userToken.langCode ?? "ID", "info_type_coa"),
            type: "select-single",
            value: query?.type
              ? { value: query?.type, label: query?.type }
              : null,
            uriSelect: "api/accounting/accountType/master",
            allLang: true,
            required: true,
          },

          {
            name: "parent",
            label: wordingTr(userToken.langCode ?? "ID", "parent_account"),
            info: wordingTr(userToken.langCode ?? "ID", "info_parent_coa"),
            type: "select-single",
            value: query?.parentId
              ? {
                  value: query?.parentId,
                  label: query?.parent?.code + " " + query?.parent?.name,
                }
              : null,
            uriSelect: "api/accounting/coa/master",
            allLang: true,
          },
        ],
      },

      {
        title: "Security",
        fields: [
          {
            name: "isActive",
            label: wordingTr(userToken.langCode ?? "ID", "active"),
            type: "switch",
            value: query?.isActive ?? true,
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
    if (langArray[0].value.value.id) {
      // Loop dan jalankan manual upsert untuk translation dan media
      // cek apakah code sudah dipakai akun lain
      const count = await prisma.account.count({
        where: {
          companyId: userToken?.companyId,
          code: langArray[0].value.value.code,
          NOT: { id: langArray[0].value.value.id }, // 👈 pengecualian record yang sedang diupdate
        },
      });

      if (count > 0) {
        return { error: "Kode akun sudah dipakai akun lain" };
      }
      const updateData: any = {
        parentId: langArray[0].value.value.parent.value ?? null,
        isActive: langArray[0].value.value.isActive,
        cashFlowCategory: langArray[0].value.value.cashFlowCategory.value,
        type: langArray[0].value.value.type.value,
        code: langArray[0].value.value.code,
        name: langArray[0].value.value.name,
        updateBy: userToken.email ?? "system",
        updatedAt: new Date(),
      };
      const valid = validateWithZod(schema, updateData);
      if (!valid.success) {
        return { error: valid.error };
      }
      await prisma.account.update({
        where: { id: langArray[0].value.value.id },
        data: updateData,
      });
      return { success: "Account updated", data: {} };
    } else {
      const count = await prisma.account.count({
        where: {
          companyId: userToken?.companyId,
          code: langArray[0].value.value.code,
        },
      });
      if (count > 0) {
        return { error: "Kode akun sudah dipakai akun lain" };
      }
      const createData = {
        parentId: langArray[0].value.value.parent.value ?? null,
        type: langArray[0].value.value.type.value,
        CashFlowCategory: langArray[0].value.value.CashFlowCategory.value,
        code: langArray[0].value.value.code,
        name: langArray[0].value.value.name,
        isActive: langArray[0].value.value.isActive ?? true,
        createBy: userToken.email ?? "system",
        createdAt: new Date(),
        companyId: userToken.companyId ?? null,
      };
      const valid = validateWithZod(schema, createData);
      if (!valid.success) {
        return { error: valid.error };
      }

      const newMenu = await prisma.account.create({
        data: createData,
      });
      return { success: "Account created", data: newMenu };
    }
  } catch (error) {
    // console.log("error", error);
    return { error: "Field tidak lengkap" };
  }
}
