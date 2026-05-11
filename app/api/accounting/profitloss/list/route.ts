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
        label: "Amount",
        key: "amount",
        type: "text",
        typeForm: "hide",
      },
    ];

    const accounts = await prisma.account.findMany({
      where: {
        companyId: userToken.companyId,
        isDeleted: false,
        type: { in: ["REVENUE", "EXPENSE"] },
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
          include: { journal: true },
        },
      },
    });

    const grouped: Record<string, any> = {
      REVENUE: {
        accountCode: wordingTr(userToken?.langCode, "revenue"),
        children: [],
        total: 0,
      },
      EXPENSE: {
        accountCode: wordingTr(userToken?.langCode, "expense"),
        children: [],
        total: 0,
      },
    };

    if (isDownload == "xls" || isDownload == "pdf") {
      // flat array
      let flatReport: {
        group: string;
        accountId: string | null;
        accountCode: string | null;
        accountName: string;
        amount: string;
        isTotal?: boolean;
      }[] = [];

      accounts.forEach((acc) => {
        let totalAmount = 0;

        acc.journalLines.forEach((line) => {
          const debit = Number(line.debit);
          const credit = Number(line.credit);

          if (acc.type === "REVENUE") totalAmount += credit - debit;
          if (acc.type === "EXPENSE") totalAmount += debit - credit;
        });

        flatReport.push({
          group: grouped[acc.type].title,
          accountId: acc.id,
          accountCode: acc.code,
          accountName: acc.name,
          amount: formatPrice(totalAmount),
        });

        grouped[acc.type].total += totalAmount;
      });

      // Tambahkan total per group
      Object.keys(grouped).forEach((key) => {
        flatReport.push({
          group: grouped[key].title,
          accountId: null,
          accountCode: null,
          accountName: `Total `,
          amount: formatPrice(grouped[key].total),
          isTotal: true,
        });
      });

      // Tambahkan summary
      flatReport.push({
        group: "SUMMARY",
        accountId: null,
        accountCode: null,
        accountName: "Net Profit",
        amount: formatPrice(grouped.REVENUE.total - grouped.EXPENSE.total),
        isTotal: true,
      });
      // Handle XLS Export
      if (isDownload === "xls") {
        return await handleExportXLS(flatReport, columns);
      }
      // Handle PDF Export
      if (isDownload === "pdf") {
        return await handleExportPDF(flatReport, columns);
      }
    } else {
      accounts.forEach((acc) => {
        let totalAmount = 0;

        acc.journalLines.forEach((line) => {
          const debit = Number(line.debit);
          const credit = Number(line.credit);

          if (acc.type === "REVENUE") totalAmount += credit - debit;
          if (acc.type === "EXPENSE") totalAmount += debit - credit;
        });

        grouped[acc.type].children.push({
          accountId: acc.id,
          accountCode: acc.code,
          accountName: acc.name,
          amount: formatPrice(totalAmount),
        });

        grouped[acc.type].total += totalAmount;
      });

      // Tambahkan total di children paling bawah
      Object.values(grouped).forEach((g: any) => {
        g.children.push({
          accountId: null,
          accountCode: null,
          accountName: "Total ",
          amount: formatPrice(g.total),
          isTotal: true,
        });
      });

      // Susun array final report
      const report = Object.values(grouped);

      // Tambahkan summary sebagai parent terakhir
      const summaryParent = {
        accountCode: wordingTr(userToken?.langCode, "summary"),
        children: [
          {
            accountId: null,
            accountName: wordingTr(userToken?.langCode, "total_revenue"),
            amount: formatPrice(grouped.REVENUE.total),
          },
          {
            accountId: null,
            accountName: wordingTr(userToken?.langCode, "total_expense"),
            amount: formatPrice(grouped.EXPENSE.total),
          },
          {
            accountId: null,
            accountName: wordingTr(userToken?.langCode, "net_profit"),
            amount: formatPrice(grouped.REVENUE.total - grouped.EXPENSE.total),
          },
        ],
      };

      report.push(summaryParent);
      const respon = ResponseHttp(200, "Success ", {
        title: "Data Journal Report",
        header: columns,
        body: report,
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

    // Hitung total debit & kredit global
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
