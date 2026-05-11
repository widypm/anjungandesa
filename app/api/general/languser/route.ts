import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../lib/response";
import { Step } from "../../../types";
import bcrypt from "bcrypt";
import { GetDecrypt } from "../../../lib/helper";
import { verifyAndParseToken } from "../../../lib/jwtParse";
import { generateZodSchema, validateWithZod } from "app/lib/zodValidasi";
import { SignJWT } from "jose";
export const dynamic = "force-dynamic";

const secret = process.env.JWT_SECRET || "defaultSecretKey";
export async function POST(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText)); // body: { ID: {...}, EN: {...} }
    const result = await saveOrUpdateUser(rawBody.lang, userToken);
    if (result.error) {
      const respon = ResponseHttp(400, result.error, {});
      const response = new NextResponse(respon, {
        status: 400,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      return response;
    }

    const respon = ResponseHttp(200, result.success, result.data);
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.error("[User POST Error]", error);
    const respon = ResponseHttp(500, "Internal Server Error", {});
    const response = new NextResponse(respon, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}

async function saveOrUpdateUser(lang: string, userToken: any) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userToken?.userId) },
    });
    const permission = await prisma.rolePermision.findMany({
      where: { roleId: user.roleId },
      select: {
        id: true,
        role: {
          select: {
            name: true,
          },
        },
        menu: {
          select: {
            translations: {
              where: { langCode: "ID" },
              select: { title: true, slug: true },
            },
          },
        },
        view: true,
        deleted: true,
        create: true,
        update: true,
      },
    });
    const secretKey = new TextEncoder().encode(secret);
    const token = await new SignJWT({
      userId: user.id.toString(),
      email: user.email,
      companyId: user.companyId,
      permission,
      loginDate: new Date().toISOString(),
      langCode: lang,
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(secretKey);

    const userSUcces = await prisma.user.update({
      where: { id: Number(userToken?.userId) },
      data: {
        token: token,
        tokenAt: new Date(),
        loginDate: new Date(),
        isLogin: true,
        langCode: lang,
      },
    });
    let datasucess: any = userSUcces;

    return { success: "Change Language Updated", data: datasucess };
  } catch (error) {
    console.log("wewwerror", error);
    return { error: error };
  }
}
