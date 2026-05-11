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
        label: wordingTr(userToken?.langCode, "date"),
        key: "date",
        type: "text",

        typeForm: "text",
        join: true,
      },
      {
        label: wordingTr(userToken?.langCode, "reference"),
        key: "reference",
        type: "text",
        sort: true,
        typeForm: "text",
        join: true,
      },
      {
        label: wordingTr(userToken?.langCode, "account_code"),
        key: "accountCode",
        type: "text",
        sort: true,
        typeForm: "text",
        join: true,
      },
      {
        label: wordingTr(userToken?.langCode, "account_name"),
        key: "accountName",
        type: "text",
        sort: true,
        typeForm: "text",
        join: true,
      },
      {
        label: wordingTr(userToken?.langCode, "description"),
        key: "description",
        type: "text",

        typeForm: "text",
      },
      {
        label: "Debit",
        key: "debit",
        type: "text",

        typeForm: "hide",
      },
      {
        label: "credit",
        key: "credit",
        type: "text",

        typeForm: "hide",
      },
      {
        label: "Balance",
        key: "balance",
        type: "text",

        typeForm: "hide",
      },
    ];
    const allowedSort = Object.fromEntries(
      columns.filter((col) => col.sort).map((col) => [col.key, true])
    );
    // Sort object untuk Prisma

    const ledger = await prisma.account.findMany({
      where: {
        companyId: userToken.companyId,
        isDeleted: false,
        journalLines: {
          some: {
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
          include: {
            journal: true,
          },
          orderBy: {
            journal: {
              date: "asc",
            },
          },
        },
      },
    });

    // Flatten ke format buku besar
    let generalLedger: any[] = [];

    ledger.forEach((acc) => {
      let runningBalance = 0;

      acc.journalLines.forEach((line) => {
        const debit = Number(line.debit);
        const credit = Number(line.credit);
        runningBalance += debit - credit;

        generalLedger.push({
          accountId: acc.id,
          accountCode: acc.code,
          accountName: acc.name,
          date: formatDateTimeIndo(line.journal.date, true),
          reference: line.journal.reference || "-",
          description: line.journal.description || "-",
          debit: formatPrice(debit),
          credit: formatPrice(credit),
          balance: formatPrice(runningBalance),
        });
      });
    });

    // Handle XLS Export
    if (isDownload === "xls") {
      return await handleExportXLS(generalLedger, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(generalLedger, columns);
    }
    // Hitung total debit & kredit global

    const respon = ResponseHttp(200, "Success ", {
      title: "Data Journal Report",
      header: columns,
      body: generalLedger,
      total: "-",
      initTable: {
        buttonAdd: false,
        searchTable: false,
        editTable: false,
        permission: getPermission(userToken?.permission, "journalreport"),
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
