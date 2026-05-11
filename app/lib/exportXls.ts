import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

export async function handleExportXLS(formatted: any[], columns: any[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("User Data");

  // Set kolom header
  sheet.columns = columns.map((col) => ({
    header: col.label,
    key: col.key,
  }));

  // Filter data hanya berdasarkan key yang ada di columns
  const allowedKeys = columns.map((col) => col.key);

  formatted.forEach((row) => {
    const filteredRow = Object.fromEntries(
      Object.entries(row).filter(([key]) => allowedKeys.includes(key))
    );
    sheet.addRow(filteredRow);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="download-data.xlsx"`,
    },
  });
}
