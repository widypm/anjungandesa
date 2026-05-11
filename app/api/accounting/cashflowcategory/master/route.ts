import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";
import { CashFlowCategory, LinkType } from "@prisma/client";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    // Semua opsi
    const allOptions = Object.values(CashFlowCategory).map((val) => ({
      value: val,
      label: val.charAt(0) + val.slice(1).toLowerCase(),
    }));

    // Filter by search (jika ada)
    const filteredOptions = search
      ? allOptions.filter(
          (opt) =>
            opt.value.toLowerCase().includes(search) ||
            opt.label.toLowerCase().includes(search)
        )
      : allOptions;

    const respon = ResponseHttp(200, "Success", filteredOptions);
    return new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "application/json", // ubah ke json
      },
    });
  } catch (error) {
    console.error("[GET /role/option]", error);
    const rsp = ResponseHttp(500, "Application Maintenance");
    return new NextResponse(rsp, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
