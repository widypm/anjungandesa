import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mime from "mime";

export async function GET(req, { params }) {
  const { filename } = params;

  const filePath = path.join(process.cwd(), "uploads/private", filename);

  // Cek file exist
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Ambil MIME type berdasar extension
  const mimeType = mime.getType(filePath) || "application/octet-stream";

  const fileBuffer = fs.readFileSync(filePath);

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000", // caching 1 tahun
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}
