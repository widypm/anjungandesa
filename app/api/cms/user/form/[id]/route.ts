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
  // example get langs array
  const langDat = await prisma.lang.findMany({
    where: { isActive: true, code: "id" },
    orderBy: {
      code: "desc", // atau 'desc' jika ingin urutan menurun
    },
  });
  // Misalnya kita ambil user pertama (atau dari token, params, dll)
  let query = null;
  if (id > 0) {
    query = await prisma.user.findUnique({
      where: { id },
      include: { role: true, company: true },
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
      title: "Info User",
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
        {
          name: "email",
          label: "Email",
          type: "email",
          value: query?.email ?? null,
          required: true,
        },
        {
          name: "companyId",
          label: "Company",
          type: "select-single",
          value: query?.companyId
            ? { value: query.companyId, label: query.company?.name }
            : {},
          required: true,
          uriSelect: "api/general/company/master",
        },
      ],
    },
    {
      title: "Security",
      fields: [
        {
          name: "password",
          label: "Password",
          type: "password-repassword",
          value: null,
          required: true,
        },
        {
          name: "role",
          label: "Role",
          type: "select-single",
          value: { value: query?.role?.id, label: query?.role?.name },
          uriSelect: "api/cms/role/master",
          required: true,
        },
        {
          name: "isActive",
          label: "Active",
          type: "switch",
          value: query?.isActive,
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
    const langs = await getForm(id);

    //default json text
    const respon = ResponseHttp(200, "Success Login", {
      title: "Form User",
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
    console.log("[User Create-form error]", error);
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

async function saveOrUpdateUser(
  langArray: { lang: string; value: any }[],
  userToken: any
) {
  const initForm = await getForm(0);
  const schema = generateZodSchema(initForm[0].data);

  if (!Array.isArray(langArray)) {
    throw new Error("Invalid body format. Expected array.");
  }

  const data =
    langArray.find((d) => d.lang === "ID")?.value || langArray[0].value;
  const { id, name, email, password, role, companyId, isActive } = data.value;

  // if (!name || !email || !role) {
  //   return { error: "Field tidak lengkap" };
  // }

  let hashedPassword: string | undefined = undefined;

  if (
    typeof password === "object" &&
    typeof password.password === "string" &&
    password.password.trim() !== ""
  ) {
    hashedPassword = await bcrypt.hash(password.password, 10);
  }

  if (id) {
    const updateData: any = {
      name,
      email,
      companyId: companyId.value,
      roleId: parseInt(role?.value ?? role),
      updateBy: userToken.email ?? "system",
      updateAt: new Date(),
      isActive,
    };
    let valid = validateWithZod(schema, updateData);
    if (!valid.success) {
      return { error: valid.error };
    }
    if (hashedPassword) {
      updateData.password = hashedPassword;
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return { success: "User updated", data: updated };
  } else {
    // if (!hashedPassword) {
    //   throw new Error("Password is required for new user creation.");
    // }
    const dataAdd: any = {
      name,
      email,
      companyId: companyId.value,
      password: hashedPassword,
      roleId: parseInt(role?.value ?? role),
      isActive: isActive,
      isDeleted: false,
      createBy: userToken.email ?? "system",
      updateBy: "-",
    };
    let valid = validateWithZod(schema, dataAdd);
    if (!valid.success) {
      return { error: valid.error };
    }
    const created = await prisma.user.create({
      data: dataAdd,
    });

    return { success: "User created", data: created };
  }
}
