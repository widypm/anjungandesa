import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
export async function handleExportPDF(
  formatted: any[],
  columns: any[],
  titleName?: string
) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  const marginX = 40;
  const marginY = 40;
  const rowHeight = 20;
  const colPadding = 5;
  const tableTopY = height - marginY;

  const colWidth = (width - 2 * marginX) / columns.length;
  let y = tableTopY;

  const drawRow = (rowData: string[], isHeader = false) => {
    columns.forEach((col, i) => {
      const x = marginX + i * colWidth;

      page.drawRectangle({
        x,
        y: y - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderWidth: 0.5,
        borderColor: rgb(0, 0, 0),
      });

      page.drawText(rowData[i], {
        x: x + colPadding,
        y: y - 15,
        size: 10,
        font: isHeader ? fontBold : font,
        color: rgb(0, 0, 0),
      });
    });

    y -= rowHeight;
  };

  // Draw Title
  page.drawText("Data " + titleName, {
    x: marginX,
    y: y,
    size: 16,
    font: fontBold,
    color: rgb(0, 0, 0),
  });

  y -= 30;

  // Header
  drawRow(
    columns.map((col) => col.label),
    true
  );

  // Data rows
  for (const row of formatted) {
    if (y < marginY + rowHeight) {
      page = pdfDoc.addPage();
      y = tableTopY;

      drawRow(
        columns.map((col) => col.label),
        true
      );
    }

    const rowData = columns.map((col) => String(row[col.key] ?? ""));
    drawRow(rowData);
  }

  const pdfBytes = await pdfDoc.save();

  // Konversi ke Buffer
  const buffer = Buffer.from(pdfBytes);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=data.pdf",
    },
  });
}
