import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { ResponseHttp } from "../../lib/response";
import { GetDecrypt } from "../../lib/helper";
import { SignJWT } from "jose";
import { prisma } from "../../lib/prisma";
const secret = process.env.JWT_SECRET || "defaultSecretKey";
export async function POST(request: NextRequest) {
  const body = await request.text();

  const reqDecrypt = JSON.parse(GetDecrypt(body));

  const { email, password } = reqDecrypt;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const rsp = ResponseHttp(404, "User/Password tidak ditemukan");
    return new NextResponse(rsp, {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    const rsp = ResponseHttp(404, "User/Password tidak ditemukan");
    return new NextResponse(rsp, {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
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
          id: true,
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
    langCode: user.langCode,
  })
    .setProtectedHeader({ alg: "HS256" })
    .sign(secretKey);

  const userSUcces = await prisma.user.update({
    where: { id: user.id },
    data: {
      token: token,
      tokenAt: new Date(),
      loginDate: new Date(),
      isLogin: true,
    },
  });
  let datasucess: any = userSUcces;
  const resString = ResponseHttp(200, "Success Login", datasucess);
  // Simpan token atau cookie
  const response = new NextResponse(resString, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });

  return response;
}
