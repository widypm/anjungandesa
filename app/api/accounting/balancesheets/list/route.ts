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
        label: wordingTr(userToken?.langCode, "amount"),
        key: "amount",
        type: "text",
      },
    ];
    const accounts = await prisma.account.findMany({
      where: {
        companyId: userToken.companyId,
        isDeleted: false,
        type: { in: ["ASSET", "LIABILITY", "EQUITY"] }, // ambil akun balance sheet
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
    if (isDownload == "xls" || isDownload == "pdf") {
      // flat array
      const flatten: {
        accountCode: string | null;
        accountName: string;
        type: string;
        amount: string;
        isTotal?: boolean;
      }[] = [];

      const grouped: Record<string, { total: number }> = {
        ASSET: { total: 0 },
        LIABILITY: { total: 0 },
        EQUITY: { total: 0 },
      };

      accounts.forEach((acc) => {
        let balance = 0;

        acc.journalLines.forEach((line) => {
          const debit = Number(line.debit);
          const credit = Number(line.credit);

          if (acc.type === "ASSET") balance += debit - credit;
          if (acc.type === "LIABILITY") balance += credit - debit;
          if (acc.type === "EQUITY") balance += credit - debit;
        });

        grouped[acc.type].total += balance;

        flatten.push({
          accountCode: acc.code,
          accountName: acc.name,
          type: acc.type,
          amount: formatPrice(balance),
        });
      });

      // Tambahkan total per kelompok
      Object.entries(grouped).forEach(([type, { total }]) => {
        flatten.push({
          accountCode: null,
          accountName:
            "Total " + wordingTr(userToken?.langCode, type.toLowerCase()),
          type,
          amount: formatPrice(total),
          isTotal: true,
        });
      });

      // Tambahkan summary (cek keseimbangan)
      flatten.push({
        accountCode: null,
        accountName: "Total Aset",
        type: "SUMMARY",
        amount: formatPrice(grouped.ASSET.total),
        isTotal: true,
      });

      flatten.push({
        accountCode: null,
        accountName: "Total Liabilitas + Ekuitas",
        type: "SUMMARY",
        amount: formatPrice(grouped.LIABILITY.total + grouped.EQUITY.total),
        isTotal: true,
      });
      // Handle XLS Export
      if (isDownload === "xls") {
        return await handleExportXLS(flatten, columns);
      }
      // Handle PDF Export
      if (isDownload === "pdf") {
        return await handleExportPDF(flatten, columns);
      }
    } else {
      const grouped: Record<string, any> = {
        ASSET: {
          accountCode: wordingTr(userToken?.langCode, "asset"),
          children: [],
          total: 0,
        },
        LIABILITY: {
          accountCode: wordingTr(userToken?.langCode, "liability"),
          children: [],
          total: 0,
        },
        EQUITY: {
          accountCode: wordingTr(userToken?.langCode, "equity"),
          children: [],
          total: 0,
        },
      };
      accounts.forEach((acc) => {
        let balance = 0;

        acc.journalLines.forEach((line) => {
          const debit = Number(line.debit);
          const credit = Number(line.credit);

          if (acc.type === "ASSET") balance += debit - credit;
          if (acc.type === "LIABILITY") balance += credit - debit;
          if (acc.type === "EQUITY") balance += credit - debit;
        });

        grouped[acc.type].children.push({
          accountId: acc.id,
          accountCode: acc.code,
          accountName: acc.name,
          amount: formatPrice(balance),
        });

        grouped[acc.type].total += balance;
      });
      // Tambahkan total di children masing-masing
      Object.values(grouped).forEach((g: any) => {
        g.children.push({
          accountId: null,
          accountCode: null,
          accountName: "Total " + g.accountCode,
          amount: formatPrice(g.total),
          isTotal: true,
        });
      });

      // Tambahkan summary (Aset vs Kewajiban + Ekuitas)
      const balanceSheet = [
        grouped.ASSET,
        grouped.LIABILITY,
        grouped.EQUITY,
        {
          accountCode: "SUMMARY",
          children: [
            {
              accountName: "Total Aset",
              amount: formatPrice(grouped.ASSET.total),
            },
            {
              accountName: "Total Liabilitas + Ekuitas",
              amount: formatPrice(
                grouped.LIABILITY.total + grouped.EQUITY.total
              ),
            },
          ],
        },
      ];

      const respon = ResponseHttp(200, "Success ", {
        title: "Data Journal Report",
        header: columns,
        body: balanceSheet,
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
    }
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
