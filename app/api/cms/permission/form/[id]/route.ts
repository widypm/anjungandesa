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
    query = await prisma.role.findUnique({
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
          name: "roleId",
          label: "Role",
          type: "text",
          value: query?.name ?? null,
          required: true,
        },
        {
          name: "menuId",
          label: "Menu",
          type: "text",
          value: query?.name ?? null,
          required: true,
        },
      ],
    },
  ];
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
    const langs = getForm(id);

    // Bentuk array langs berdasarkan hasil langDat

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
  try {
    const { id, roleId, view, create, update, deleted, menuId } = data[0].value;
    // console.log("data ahja", data[0]);
    const initForm = await getForm(0);
    const schema = generateZodSchema(initForm[0].data);
    const checkPermission = await prisma.rolePermision.findFirst({
      where: {
        roleId: roleId?.value,
        menuId: menuId?.value,
        companyId: userToken?.companyId,
      },
      select: {
        id: true,
      },
    });
    if (checkPermission?.id) {
      // 🔄 Update
      const updated = await prisma.rolePermision.update({
        where: { id: Number(checkPermission?.id) },
        data: {
          updateBy: userToken.email ?? "-",
          roleId: roleId.value,
          menuId: menuId.value,
          view,
          create,
          deleted,
          update,
          updateAt: new Date(),
        },
      });
      let valid = validateWithZod(schema, updated);
      if (!valid.success) {
        return { error: "Perrmisiionss" + valid.error };
      }
      return { success: "Role updated", data: updated };
    } else {
      // ➕ Create user
      const data = {
        roleId: roleId?.value,
        menuId: menuId?.value,
        view: view || false,
        create: create || false,
        deleted: deleted || false,
        update: update || false,
        isActive: true,
        isDeleted: false,
        createBy: userToken.email ?? "system",
        updateBy: "-",
        createdAt: new Date(),
        companyId: userToken?.companyId ?? null,
      };
      let valid = validateWithZod(schema, data);
      if (!valid.success) {
        return { error: valid.error };
      }
      const created = await prisma.rolePermision.create({
        data,
      });

      return { success: "Permission created", data: created };
    }
  } catch (error) {
    console.log("error aja", error);
    return { error: "Error Server:" + error };
  }
}
