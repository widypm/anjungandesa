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
        label: "Created At",
        key: "createdAt",
        type: "text",

        typeForm: "hide",
      },
    ];
    const allowedSort = Object.fromEntries(
      columns.filter((col) => col.sort).map((col) => [col.key, true])
    );
    // Sort object untuk Prisma

    const [menus] = await prisma.$transaction([
      prisma.journalEntry.findMany({
        where: {
          companyId: userToken.companyId,
          isDeleted: false,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          lines: {
            include: {
              account: true, // ambil nama akun
            },
          },
        },
        orderBy: { date: "asc" },
      }),
    ]);

    // Ubah ke format simpel
    // Ubah ke format simpel
    const flatMenus = menus.map((m) => {
      const totalDebit = m.lines.reduce((sum, l) => sum + Number(l.debit), 0);
      const totalCredit = m.lines.reduce((sum, l) => sum + Number(l.credit), 0);

      return {
        id: m.id,
        reference: m.reference || "-",
        description: m.description || "-",
        date: formatDateTimeIndo(m.date, true),
        isActive: m.isActive,
        createdAt: formatDateTimeIndo(m.createdAt),
        totalDebit: formatPrice(totalDebit),
        totalCredit: formatPrice(totalCredit),
        children: m.lines.map((l) => {
          const debitVal = Number(l.debit);
          const creditVal = Number(l.credit);

          return {
            id: l.id,
            accountId: l.account.id,
            accountCode: l.account.code,
            accountName: l.account.name,
            debit: formatPrice(debitVal),
            credit: formatPrice(creditVal),
            debitFormatted: debitVal,
            creditFormatted: creditVal,
          };
        }),
      };
    });

    // Format flat parent + child rows
    const noParent = menus.flatMap((m) => {
      const totalDebit = m.lines.reduce((sum, l) => sum + Number(l.debit), 0);
      const totalCredit = m.lines.reduce((sum, l) => sum + Number(l.credit), 0);

      // Row utama (Journal Entry)
      const parentRow = {
        id: m.id,
        type: "ENTRY",
        reference: m.reference || "-",
        description: m.description || "-",
        date: formatDateTimeIndo(m.date, true),
        isActive: m.isActive,
        createdAt: formatDateTimeIndo(m.createdAt),
        debit: formatPrice(totalDebit),
        credit: formatPrice(totalCredit),
      };

      // Row anak (Journal Lines)
      const childRows = m.lines.map((l) => {
        const debitVal = Number(l.debit);
        const creditVal = Number(l.credit);

        return {
          id: l.id,
          type: "LINE",
          reference: "",
          description: l.account.name,
          date: "",
          isActive: true,
          createdAt: "",
          debit: formatPrice(debitVal),
          credit: formatPrice(creditVal),
          accountId: l.account.id,
          accountCode: l.account.code,
          accountName: l.account.name,
        };
      });

      return [parentRow, ...childRows];
    });
    // 🔹 Hitung total global (semua parent & child)
    const totalDebitAll = menus.reduce(
      (sum, m) => sum + m.lines.reduce((s, l) => s + Number(l.debit), 0),
      0
    );
    const totalCreditAll = menus.reduce(
      (sum, m) => sum + m.lines.reduce((s, l) => s + Number(l.credit), 0),
      0
    );

    // 🔹 Tambah row TOTAL di bawah
    noParent.push({
      id: "total-row",
      type: "",
      reference: "",
      description: "",
      date: "TOTAL",
      isActive: false,
      createdAt: "",
      debit: formatPrice(totalDebitAll),
      credit: formatPrice(totalCreditAll),
    });

    // Handle XLS Export
    if (isDownload === "xls") {
      return await handleExportXLS(noParent, columns);
    }
    // Handle PDF Export
    if (isDownload === "pdf") {
      return await handleExportPDF(noParent, columns);
    }
    // Hitung total debit & kredit global

    const totalDebitGlobal = flatMenus.reduce(
      (sum, entry) =>
        sum + entry.children.reduce((s, line) => s + line.debitFormatted, 0),
      0
    );

    const totalCreditGlobal = flatMenus.reduce(
      (sum, entry) =>
        sum + entry.children.reduce((s, line) => s + line.creditFormatted, 0),
      0
    );

    // Tambahkan ke footer
    const footerTable = [
      {
        date: "Total",
        debit: formatPrice(totalDebitGlobal),
        credit: formatPrice(totalCreditGlobal),
      },
    ];
    const respon = ResponseHttp(200, "Success ", {
      title: "Data Journal Report",
      header: columns,
      body: flatMenus,
      total: "-",
      initTable: {
        buttonAdd: false,
        searchTable: false,
        editTable: false,
        permission: getPermission(userToken?.permission, "journalreport"),
        formSearch: formSearch,
        footerTable: footerTable,
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
