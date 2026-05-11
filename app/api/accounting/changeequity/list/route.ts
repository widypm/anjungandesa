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
        label: wordingTr(userToken?.langCode, "account_name"),
        key: "item",
        type: "text",

        typeForm: "text",
      },

      {
        label: "Amount",
        key: "amount",
        type: "text",
      },
    ];

    // Hitung saldo awal ekuitas (sampai sebelum startDate)
    const openingEquityLines = await prisma.journalLine.findMany({
      where: {
        account: {
          companyId: userToken.companyId,
          isDeleted: false,
          type: "EQUITY",
        },
        journal: {
          date: { lt: startDate },
          isDeleted: false,
        },
      },
      include: { account: true },
    });

    let openingEquity = 0;
    openingEquityLines.forEach((line) => {
      openingEquity += Number(line.credit) - Number(line.debit);
    });

    // Hitung perubahan ekuitas selama periode
    const equityLines = await prisma.journalLine.findMany({
      where: {
        account: {
          companyId: userToken.companyId,
          isDeleted: false,
          type: "EQUITY",
        },
        journal: {
          date: { gte: startDate, lte: endDate },
          isDeleted: false,
        },
      },
      include: { account: true },
    });

    let additionalCapital = 0;
    let withdrawals = 0;

    equityLines.forEach((line) => {
      const amount = Number(line.credit) - Number(line.debit);
      if (line.account.code.startsWith("3")) {
        // contoh kode 3xxx = modal tambahan
        additionalCapital += amount;
      }
      if (line.account.code.startsWith("31")) {
        // contoh kode 31xx = prive/dividen
        withdrawals += amount;
      }
    });

    // Ambil laba rugi periode berjalan
    const profitLoss = await getProfitLoss(
      userToken?.companyId,
      startDate,
      endDate
    );
    // -> function sebelumnya, return { netIncome: number }

    const endingEquity =
      openingEquity + profitLoss.netIncome + additionalCapital - withdrawals;

    // Bentuk laporan flatten
    const equityReport = [
      {
        item: "Saldo Awal Ekuitas",
        amount: formatPrice(openingEquity),
      },
      {
        item: "Laba (Rugi) Bersih",
        amount: formatPrice(profitLoss.netIncome),
      },
      {
        item: "Tambahan Modal",
        amount: formatPrice(additionalCapital),
      },
      {
        item: "Prive / Dividen",
        amount: formatPrice(-withdrawals),
      },
      {
        item: "Saldo Akhir Ekuitas",
        amount: formatPrice(endingEquity),
        isTotal: true,
      },
    ];

    // Handle XLS Export
    if (isDownload === "xls") {
      return await handleExportXLS(equityReport, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(equityReport, columns, "Data Trial Balance");
    }
    // Hitung total debit & kredit global

    const respon = ResponseHttp(200, "Success ", {
      title: "Data Trial Balance",
      header: columns,
      body: equityReport,
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
async function getProfitLoss(
  companyId: string,
  startDate: Date,
  endDate: Date
) {
  const accounts = await prisma.account.findMany({
    where: {
      companyId,
      isDeleted: false,
      type: { in: ["REVENUE", "EXPENSE"] },
    },
    include: {
      journalLines: {
        where: {
          journal: {
            date: { gte: startDate, lte: endDate },
            isDeleted: false,
          },
        },
      },
    },
  });

  let totalRevenue = 0;
  let totalExpense = 0;

  accounts.forEach((acc) => {
    let amount = 0;

    acc.journalLines.forEach((line) => {
      const debit = Number(line.debit);
      const credit = Number(line.credit);

      if (acc.type === "REVENUE") {
        amount += credit - debit;
      } else if (acc.type === "EXPENSE") {
        amount += debit - credit;
      }
    });

    if (acc.type === "REVENUE") totalRevenue += amount;
    if (acc.type === "EXPENSE") totalExpense += amount;
  });

  const netIncome = totalRevenue - totalExpense;

  return {
    revenue: totalRevenue,
    expense: totalExpense,
    netIncome,
    formatted: {
      revenue: formatPrice(totalRevenue),
      expense: formatPrice(totalExpense),
      netIncome: formatPrice(netIncome),
    },
  };
}
