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
        label: wordingTr(userToken?.langCode, "accountCode"),
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
        label: "Amount",
        key: "amount",
        type: "text",
      },
    ];

    const data = await getCashFlowReport(
      userToken?.companyId,
      startDate,
      endDate
    );
    // Handle XLS Export
    if (isDownload === "xls") {
      return await handleExportXLS(data.flatReport, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(
        data.flatReport,
        columns,
        "Data Trial Balance"
      );
    }
    // Hitung total debit & kredit global

    const respon = ResponseHttp(200, "Success ", {
      title: "Data Trial Balance",
      header: columns,
      body: data.childrenReport,
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
    // console.log(error);
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

async function getCashFlowReport(
  companyId: string,
  startDate: Date,
  endDate: Date
) {
  // Ambil data akun + journal
  const accounts = await prisma.account.findMany({
    where: {
      companyId,
      isDeleted: false,
      type: { in: ["ASSET", "LIABILITY", "EQUITY", "EXPENSE", "REVENUE"] },
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
  });

  // Struktur laporan (Children)
  const grouped: Record<string, any> = {
    OPERATING: {
      accountCode: "Arus Kas dari Aktivitas Operasi",
      children: [],
      total: 0,
    },
    INVESTING: {
      accountCode: "Arus Kas dari Aktivitas Investasi",
      children: [],
      total: 0,
    },
    FINANCING: {
      accountCode: "Arus Kas dari Aktivitas Pendanaan",
      children: [],
      total: 0,
    },
  };

  // Versi flat
  let flatReport: any[] = [];

  // Mapping akun → kategori cash flow
  const classify = (acc: any) => {
    if (acc.cashFlowCategory) return acc.cashFlowCategory;
    if (acc.code.startsWith("1")) return "OPERATING"; // misal: kas, piutang, hutang usaha
    if (acc.code.startsWith("2")) return "INVESTING"; // misal: aset tetap
    if (acc.code.startsWith("3")) return "FINANCING"; // misal: modal, pinjaman
    return "OPERATING";
  };

  accounts.forEach((acc) => {
    let total = 0;

    acc.journalLines.forEach((line) => {
      total += Number(line.debit) - Number(line.credit);
    });

    if (total !== 0) {
      const category = classify(acc);

      // Children version
      grouped[category].children.push({
        accountId: acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        amount: formatPrice(total),
      });

      grouped[category].total += total;

      // Flat version
      flatReport.push({
        category,
        accountId: acc.id,
        accountCode: acc.code,
        accountName: acc.name,
        amount: formatPrice(total),
      });
    }
  });

  // Tambahkan total di children tiap kategori
  Object.values(grouped).forEach((g: any) => {
    g.children.push({
      accountId: null,
      accountCode: null,
      accountName: "Total " + g.accountCode,
      amount: formatPrice(g.total),
      isTotal: true,
    });
  });

  // Tambahkan summary di akhir (Children)
  const grandTotal =
    grouped.OPERATING.total + grouped.INVESTING.total + grouped.FINANCING.total;

  const childrenReport = [
    grouped.OPERATING,
    grouped.INVESTING,
    grouped.FINANCING,
    {
      accountCode: "Kenaikan (Penurunan) Bersih Kas",
      children: [
        {
          accountId: null,
          accountCode: null,
          accountName: "Total Arus Kas",
          amount: formatPrice(grandTotal),
          isTotal: true,
        },
      ],
      total: grandTotal,
    },
  ];

  // Tambahkan summary ke versi flat juga
  flatReport.push({
    category: "SUMMARY",
    accountId: null,
    accountCode: null,
    accountName: "Total Arus Kas",
    amount: formatPrice(grandTotal),
    isTotal: true,
  });

  return {
    childrenReport, // hierarki
    flatReport, // untuk XLS
  };
}
