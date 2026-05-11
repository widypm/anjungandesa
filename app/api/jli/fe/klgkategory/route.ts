import { ResponseHttp } from "app/lib/response";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

let cache: any = null;
let cacheTime = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 menit

export async function GET() {
  const now = Date.now();

  // Jika cache masih valid → return cache
  if (cache && now - cacheTime < CACHE_DURATION_MS) {
    return new NextResponse(cache, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600", // browser & CDN cache 10 menit
      },
    });
  }

  // Query ke database jika cache kosong atau expired
  const data = await prisma.klgKategory.findMany();
  const respon = ResponseHttp(200, "Success", data);

  // Simpan ke cache
  cache = respon;
  cacheTime = now;

  return new NextResponse(respon, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=600",
    },
  });
}
