import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ResponseHttp } from "./app/lib/response";

const secret = process.env.JWT_SECRET || "defaultSecretKey";
const PROTECTED_PREFIXES = ["/api"];
const EXCLUDED_PATHS = [
  "/api/auth/login",
  "/api/filemanager",
  "/api/log",
  "/api/auth",
  "/api/files",
  "/api/fe/v1/page",
  "/api/fe/v1/changelang",
  "/api/fe/v1/gen",
  "/api/fe/v1/inpaket",
  "/api/fe/v1/inrkakl",
  "/api/jli/fe/daerah",
  "/api/jli/fe/klgkategory",
  "/api/jli/fe/gettime",
  "/api/jli/fe/getpto",
  "/api/jli/fe/postklg",
  "/api/ocr",
  "/api/jli/fe/postklgpengajuan",
  "/api/jli/fe/postklguploadid",
  "/api/anjungan/fe/createSurat",
  "/api/anjungan/surat/update-status",
  "/api/anjungan/dashboard",
];

async function verifyToken(token: string) {
  const secretKey = new TextEncoder().encode(secret);
  return await jwtVerify(token, secretKey);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isExcluded = EXCLUDED_PATHS.some((excluded) =>
    pathname.startsWith(excluded),
  );

  if (!isProtected || isExcluded) return NextResponse.next();

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token) {
    return new NextResponse(ResponseHttp(401, "Token invalid"), {
      status: 401,
      headers: { "Content-Type": "text/plain" },
    });
  }

  try {
    const decoded = await verifyToken(token);
    // Logging async tanpa block response
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    const referer = request.headers.get("referer");
    const fePath = referer ? new URL(referer).pathname : "-";
    const parts = pathname.split("/");
    const module = parts[2] || "-";

    const bodyText = ["POST", "PUT", "PATCH"].includes(method)
      ? await request.text()
      : "";

    const dataLog = {
      userId: Number(decoded?.payload?.userId ?? 0),
      user:
        typeof decoded?.payload?.email === "string"
          ? decoded.payload.email
          : "unknown",
      ip,
      urlApi: pathname,
      urlFe: fePath,
      methodApi: method,
      bodyApi: bodyText,
      menuId: 0,
      menuLabel: "-",
      pageId: 0,
      PageLabel: "-",
      createBy: "system",
      updateBy: "system",
      modulename: module,
    };

    queueMicrotask(() => {
      fetch(`${process.env.NEXT_PUBLIC_DOMAIN_API_FULL}api/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataLog),
        keepalive: true,
      }).catch((err) => {
        console.error("Log failed", err);
      });
    });

    return NextResponse.next();
  } catch (err) {
    console.log("Token error:", err);
    return new NextResponse(ResponseHttp(401, "Token invalid", "", err), {
      status: 401,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
