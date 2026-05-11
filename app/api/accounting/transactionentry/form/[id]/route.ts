import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../../lib/response";
import { Step } from "../../../../../types";
import {
  cleanContent,
  formatDateToInput,
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
            name: "date",
            label: wordingTr(userToken.langCode ?? "ID", "date"),
            info: wordingTr(userToken.langCode ?? "ID", "info_date_journal"),
            type: "date",
            value: formatDateToInput(query?.date) ?? "",
            required: true,
            cols: "col-span-4",
          },
          {
            name: "statusJournal",
            label: wordingTr(userToken.langCode ?? "ID", "Status"),
            info: wordingTr(userToken.langCode ?? "ID", "info_status_journal"),
            type: "select-single",
            value: query?.statusJournal
              ? { value: query?.statusJournal, label: query?.statusJournal }
              : { value: "DRAFT", label: "DRAFT" },
            required: true,
            cols: "col-span-4",
            uriSelect: "api/accounting/statusjournal/master",
          },
          {
            name: "typeTransaction",
            label: wordingTr(userToken.langCode ?? "ID", "type_transaction"),
            info: wordingTr(
              userToken.langCode ?? "ID",
              "info_type_transaction_trx"
            ),
            type: "select-single",
            value: query?.typeTransactionId,
            cols: "col-span-4",
            uriSelect: "api/accounting/typetransaction/master",
          },
          {
            name: "reference",
            label: wordingTr(userToken.langCode ?? "ID", "reference_no"),
            info: wordingTr(
              userToken.langCode ?? "ID",
              "info_reference_no_journal"
            ),
            type: "text",
            value: query?.reference ?? "",
            required: true,
            cols: "col-span-4",
          },
          {
            name: "description",
            label: wordingTr(userToken.langCode ?? "ID", "description"),
            info: wordingTr(
              userToken.langCode ?? "ID",
              "info_description_journal"
            ),
            type: "text",
            value: query?.description ?? "",
            required: true,
            cols: "col-span-4",
          },
          {
            name: "debit",
            label: wordingTr(userToken.langCode ?? "ID", "amount"),
            info: wordingTr(userToken.langCode ?? "ID", "info_amount_trx"),
            type: "price",
            value: query?.amount ?? "",
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
      title: wordingTr(userToken.langCode ?? "ID", "form_transaction_entry"),
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
  console.log("testfrm", langArray);
  if (!Array.isArray(langArray)) {
    return { error: "Field tidak lengkap" };
  }

  try {
    const idAccount = await prisma.typeTransaction.findFirst({
      where: {
        id: langArray[0].value.value.typeTransaction.value,
      },
      select: {
        creditAccountId: true,
        debitAccountId: true,
      },
    });

    if (langArray[0].value.value.id) {
      const updateData: Prisma.JournalEntryUpdateInput = {
        description: langArray[0].value.value.description,
        reference: langArray[0].value.value.reference,
        date: toPrismaDateTime(langArray[0].value.value.date),
        updateBy: userToken.email ?? "system",
        typeTransaction: {
          connect: { id: langArray[0].value.value.typeTransaction.value },
        },
        updatedAt: new Date(),
        lines: {
          create: [
            {
              account: { connect: { id: idAccount.debitAccountId } },
              debit: langArray[0].value.value.amount,
              credit: 0,
              description: langArray[0].value.value.description,
            },
            {
              account: { connect: { id: idAccount.creditAccountId } },
              debit: 0,
              credit: langArray[0].value.value.amount,
              description: langArray[0].value.value.description,
            },
          ],
        },
      };
      const valid = validateWithZod(schema, updateData);
      if (!valid.success) {
        return { error: valid.error };
      }
      await prisma.journalEntry.update({
        where: { id: langArray[0].value.value.id },
        data: updateData,
      });
      return { success: "Transaksi updated", data: {} };
    } else {
      const createData: Prisma.JournalEntryCreateInput = {
        description: langArray[0].value.value.description,
        reference: langArray[0].value.value.reference,
        date: toPrismaDateTime(langArray[0].value.value.date),
        source: "TRANSACTIONENTRY",
        createBy: userToken.email ?? "system",
        createdAt: new Date(),
        typeTransaction: {
          connect: { id: langArray[0].value.value.typeTransaction.value },
        },
        company: {
          connect: { id: userToken.companyId },
        },
        lines: {
          create: [
            {
              accountId: idAccount.debitAccountId,
              debit: langArray[0].value.value.debit,
              credit: 0,
              description: langArray[0].value.value.description,
            },
            {
              accountId: idAccount.creditAccountId,
              debit: 0,
              credit: langArray[0].value.value.debit,
              description: langArray[0].value.value.description,
            },
          ],
        },
      };

      const valid = validateWithZod(schema, createData);
      if (!valid.success) {
        return { error: valid.error };
      }
      // Validasi balance dulu
      const validLines = validateJournalLines(
        createData.lines!
          .create as Prisma.JournalLineCreateWithoutJournalInput[]
      );
      if (!validLines.success) {
        return { error: validLines.error };
      }

      const newMenu = await prisma.journalEntry.create({
        data: createData,
      });
      return { success: "Transaksi created", data: newMenu };
    }
  } catch (error) {
    console.log("error", error);
    return { error: "Something Worng..." };
  }
}
type LineInput =
  | Prisma.JournalLineCreateWithoutJournalInput
  | Prisma.JournalLineUncheckedCreateWithoutJournalInput;
function validateJournalLines(lines: LineInput[]) {
  const totalDebit = lines.reduce((sum, l) => sum + Number(l.debit ?? 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + Number(l.credit ?? 0), 0);

  if (totalDebit !== totalCredit) {
    return {
      success: false,
      error: `Debit (${totalDebit}) tidak sama dengan Credit (${totalCredit})`,
    };
  }
  return { success: true };
}
