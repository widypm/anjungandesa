// app/api/table/data/route.ts
import { prisma } from "../../../../lib/prisma"; // pastikan path benar
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { buildSearchFilter } from "../../../../lib/buildSearchFilter";
import { handleExportXLS } from "../../../../lib/exportXls";
import { handleExportPDF } from "../../../../lib/exportPdf";
import { HeaderTable } from "../../../../types";
import {
  formatDateTimeIndo,
  formatDateToInput,
  formatPrice,
  getPermission,
} from "../../../../lib/helper";
import { verifyAndParseToken } from "../../../../lib/jwtParse";
import { wordingTr } from "app/lib/translationWording";
import { FaAudioDescription } from "react-icons/fa";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "createdAt"; // default sorting
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = startDateParam
      ? new Date(startDateParam + "T00:00:00.000Z")
      : new Date(new Date().setHours(0, 0, 0, 0)); // default: hari ini jam 00:00

    const endDate = endDateParam
      ? new Date(endDateParam + "T23:59:59.999Z")
      : new Date(new Date().setHours(23, 59, 59, 999)); // default: hari ini jam 23:59
    const order = searchParams.get("order") === "asc" ? "asc" : "desc"; // default desc
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const isDownload = searchParams.get("isdownload"); // pdf / xls
    const skip = (page - 1) * limit;
    const userToken = await verifyAndParseToken(req);
    const formSearch = [
      {
        name: "startDate",
        value: formatDateToInput(startDate),
        type: "date",
        label: wordingTr(userToken?.langCode, "start_date"),
        cols: "col-span-4",
      },
      {
        name: "endDate",
        value: formatDateToInput(endDate),
        type: "date",
        label: wordingTr(userToken?.langCode, "end_date"),
        cols: "col-span-4",
      },
    ];

    const columns: HeaderTable[] = [
      {
        label: wordingTr(userToken?.langCode, "account_code"),
        key: "accountCode",
        type: "text",

        typeForm: "text",
      },
      {
        label: wordingTr(userToken?.langCode, "account_name"),
        key: "accountName",
        type: "text",

        typeForm: "text",
      },

      {
        label: "Debit",
        key: "debit",
        type: "text",
      },
      {
        label: "credit",
        key: "credit",
        type: "text",
      },
    ];

    const accounts = await prisma.account.findMany({
      where: {
        companyId: userToken.companyId,
        isDeleted: false,
      },
      include: {
        journalLines: {
          where: {
            journal: {
              date: {
                gte: startDate,
                lte: endDate,
              },
              isDeleted: false,
            },
          },
        },
      },
      orderBy: { code: "asc" },
    });
    let trialBalance: any[] = [];
    let totalDebit = 0;
    let totalCredit = 0;
    const accountMap = new Map<string, any>();
    accounts.forEach((acc) => accountMap.set(acc.id, acc));

    function getAccountPath(acc: any): string {
      let names: string[] = [acc.name];
      let current = acc;
      while (current.parentId && accountMap.has(current.parentId)) {
        current = accountMap.get(current.parentId);
        names.unshift(current.name); // prepend parent
      }
      return names.join(" / ");
    }
    accounts.forEach((acc) => {
      let debit = 0;
      let credit = 0;

      acc.journalLines.forEach((line) => {
        debit += Number(line.debit);
        credit += Number(line.credit);
      });

      if (debit !== 0 || credit !== 0) {
        trialBalance.push({
          accountId: acc.id,
          accountCode: acc.code,
          accountName: getAccountPath(acc),
          debit: formatPrice(debit),
          credit: formatPrice(credit),
        });
      }

      totalDebit += debit;
      totalCredit += credit;
    });

    // Tambahkan total summary
    trialBalance.push({
      accountId: null,
      accountCode: null,
      accountName: "TOTAL",
      debit: formatPrice(totalDebit),
      credit: formatPrice(totalCredit),
      isTotal: true,
    });

    // Handle XLS Export
    if (isDownload === "xls") {
      return await handleExportXLS(trialBalance, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(trialBalance, columns, "Data Trial Balance");
    }
    // Hitung total debit & kredit global

    const respon = ResponseHttp(200, "Success ", {
      title: "Data Trial Balance",
      header: columns,
      body: trialBalance,
      total: "-",
      initTable: {
        buttonAdd: false,
        searchTable: false,
        editTable: false,
        permission: getPermission(userToken?.permission, "trialbalance"),
        formSearch: formSearch,
        isAction: false,
      },
    });
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.log(error);
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
