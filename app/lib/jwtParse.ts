import { jwtVerify } from "jose";
import { NextApiRequest } from "next";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "defaultSecretKey"
);

export interface JwtPayloadCustom {
  userId: number;
  email: string;
  companyId: string;
  loginDate: Date;
  permission: object[];
  langCode: string;
}

type ReqLike = NextApiRequest | Request;

/**
 * Ambil token dari Authorization header (support Request & NextApiRequest).
 */
export function getTokenFromHeader(req: ReqLike): string | null {
  let authHeader = "";
  if ("headers" in req && typeof req.headers.get === "function") {
    // Web API Request (App Router)
    authHeader = req.headers.get("authorization") || "";
  } else if ("headers" in req && typeof req.headers === "object") {
    // NextApiRequest (Page Router)
    authHeader = (req as NextApiRequest).headers.authorization || "";
  }
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

/**
 * Verifikasi JWT dan kembalikan payload yang telah diparsing.
 */
export async function verifyAndParseToken(
  req: ReqLike
): Promise<JwtPayloadCustom | null> {
  const token = getTokenFromHeader(req);
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayloadCustom;
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return null;
  }
}
export async function getCookiesToken(
  req: NextRequest
): Promise<JwtPayloadCustom | null> {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Validasi properti payload
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      typeof payload.companyId == "string" &&
      typeof payload.loginDate == "string" &&
      Array.isArray(payload.permission) &&
      typeof payload.langCode == "string"
    ) {
      return {
        userId: Number(payload.userId),
        email: payload.email,
        companyId: payload.companyId,
        loginDate: new Date(payload.loginDate),
        permission: payload.permission as object[],
        langCode: payload.langCode,
      };
    }

    return null;
  } catch (err) {
    console.error("❌ JWT verification failed:", err);
    return null;
  }
}
