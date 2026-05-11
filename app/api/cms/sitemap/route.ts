export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { writeFileSync } from "fs";
import path from "path";
import { prisma } from "../../../lib/prisma"; // pastikan path benar
import { verifyAndParseToken } from "app/lib/jwtParse";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://solusi-app.com";

export async function GET(req: Request) {
  try {
    // Ambil data dari model Prisma (misal Menu)
    const userToken: any = await verifyAndParseToken(req);
    const items = await prisma.pageTranslation.findMany({
      where: {
        companyId: userToken?.companyId,
      },
      select: { slug: true, updatedAt: true, isDeleted: false }, // sesuaikan kolom
    });

    // Format URL XML
    const urls = items
      .map((item) => {
        const lastmod = item.updatedAt
          ? new Date(item.updatedAt).toISOString()
          : new Date().toISOString();
        return `
      <url>
        <loc>${BASE_URL}/${item.slug}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
      })
      .join("");

    // Buat XML lengkap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    // Simpan ke /public/sitemap.xml
    const filePath = path.join(process.cwd(), "public", "sitemap.xml");
    writeFileSync(filePath, sitemap);

    return NextResponse.json({ success: true, message: "Sitemap generated" });
  } catch (error: any) {
    console.error("Error generating sitemap:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
