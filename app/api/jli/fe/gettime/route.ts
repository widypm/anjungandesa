import { ResponseHttp } from "app/lib/response";
import { NextResponse } from "next/server";

export async function GET() {
  const now = Date.now(); // timestamp dalam ms
  const iso = new Date(now).toISOString();
  const respon = ResponseHttp(200, "Success", {
    requestTime: now,
    iso,
  });
  const response = new NextResponse(respon, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
  return response;
}
