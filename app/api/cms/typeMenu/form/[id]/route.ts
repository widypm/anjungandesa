import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../../lib/response";
import { Step } from "../../../../../types";
import bcrypt from "bcrypt";
import { GetDecrypt } from "../../../../../lib/helper";
import { verifyAndParseToken } from "../../../../../lib/jwtParse";
import { generateZodSchema, validateWithZod } from "app/lib/zodValidasi";
export const dynamic = "force-dynamic";
async function getForm(id: number) {
  const langDat = await prisma.lang.findMany({
    where: { isActive: true, code: "id" },
    orderBy: {
      code: "desc", // atau 'desc' jika ingin urutan menurun
    },
  });
  // Misalnya kita ambil user pertama (atau dari token, params, dll)
  let query = null;
  if (id > 0) {
    query = await prisma.menuType.findUnique({
      where: { id },
    });

    if (!query || query.isDeleted) {
      return new NextResponse(ResponseHttp(404, "Data Not Found"), {
        status: 404,
      });
    }
  }
  // Form step
  const steps: Step[] = [
    {
      title: "Info Role",
      fields: [
        {
          name: "id",
          label: "id",
          type: "hide",
          value: query?.id ?? null,
        },
        {
          name: "name",
          label: "Nama Lengkap",
          type: "text",
          value: query?.name ?? null,
          required: true,
        },
      ],
    },
  ];

  // Bentuk array langs berdasarkan hasil langDat
  const langs = langDat.map((lang) => ({
    name: lang.code, // pastikan kolom di database namanya `code`
    data: steps,
  }));
  return langs;
}
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    // example get langs array
    const langs = await getForm(id);

    //default json text
    const respon = ResponseHttp(200, "Success Login", {
      title: "Form Role",
      data: langs,
    });
    const response = new NextResponse(respon, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  } catch (error) {
    console.log("[Role Create-form error]", error);
    const rsp = ResponseHttp(500, "Application Maintenace");
    const response = new NextResponse(rsp, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }
}
export async function POST(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText)); // body: { ID: {...}, EN: {...} }
    const body = Object.entries(rawBody).map(([lang, value]) => ({
      lang: lang.toUpperCase(),
      value,
    }));
    const result = await saveOrUpdateUser(body, userToken);

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
export async function PUT(req: Request) {
  try {
    const userToken = await verifyAndParseToken(req);
    const bodyText = await req.text();
    const rawBody = JSON.parse(GetDecrypt(bodyText)); // body: { ID: {...}, EN: {...} }
    const body = Object.entries(rawBody).map(([lang, value]) => ({
      lang: lang.toUpperCase(),
      value,
    }));

    const result = await saveOrUpdateUser(body, userToken);

    if (result.error) {
      const respon = ResponseHttp(400, result.error, {});
      const response = new NextResponse(respon, {
        status: 200,
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
    console.error("[User PUT Error]", error);
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
async function saveOrUpdateUser(data: any, userToken: any) {
  const { id, name } = data[0].value;
  // console.log("data ahja", data);
  const initForm = await getForm(0);
  const schema = generateZodSchema(initForm[0].data);

  if (id) {
    // 🔄 Update
    const updateData: any = {
      name,
      updateBy: userToken.email ?? "system",
      updateAt: new Date(),
    };
    try {
      let valid = validateWithZod(schema, updateData);
      if (!valid.success) {
        return { error: valid.error };
      }
      const updated = await prisma.menuType.update({
        where: { id: parseInt(id) },
        data: updateData,
      });
      return { success: "typemenu updated", data: updated };
    } catch (error) {
      console.log("", error);
      return { error: "Field tidak lengkap" };
    }
  } else {
    // ➕ Create user
    try {
      const data = {
        name,
        isActive: true,
        createdAt: new Date(),
        createBy: userToken.email ?? "system",
        companyId: userToken.companyId,
      };
      let valid = validateWithZod(schema, data);
      if (!valid.success) {
        return { error: valid.error };
      }
      const created = await prisma.menuType.create({
        data,
      });

      return { success: "typemenu created", data: created };
    } catch (error) {
      console.log("", error);
      return { error: "Field tidak lengkap" };
    }
  }
}
