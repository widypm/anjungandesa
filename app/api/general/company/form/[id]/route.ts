import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma"; // pastikan path benar
import { ResponseHttp } from "../../../../../lib/response";
import { Step } from "../../../../../types";
import { GetDecrypt } from "../../../../../lib/helper";
import { verifyAndParseToken } from "../../../../../lib/jwtParse";
import { generateZodSchema, validateWithZod } from "app/lib/zodValidasi";
export const dynamic = "force-dynamic";
async function getForm(id: string) {
  const langDat = await prisma.lang.findMany({
    where: { isActive: true, code: "id" },
    orderBy: {
      code: "desc", // atau 'desc' jika ingin urutan menurun
    },
  });
  // Misalnya kita ambil user pertama (atau dari token, params, dll)
  let query = null;
  if (id != "0") {
    query = await prisma.company.findUnique({
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
      title: "Info Company",
      fields: [
        {
          name: "id",
          label: "id",
          type: "hide",
          value: query?.id ?? null,
        },
        {
          name: "name",
          label: "Nama",
          type: "text",
          value: query?.name ?? null,
          required: true,
        },
        {
          name: "phone",
          label: "Phone",
          type: "number",
          value: query?.phone ?? null,
          required: true,
        },
        {
          name: "email",
          label: "Email",
          type: "text",
          value: query?.email ?? null,
          required: true,
        },
        {
          name: "address",
          label: "Address",
          type: "text",
          value: query?.address ?? null,
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
    const id = params.id;
    // example get langs array
    const langs = await getForm(id);

    //default json text
    const respon = ResponseHttp(200, "Success Login", {
      title: "Form Company",
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
  const { id, name, phone, email, address } = data[0]?.value?.value;
  console.log("data ahja", data[0].value.value);
  const initForm = await getForm("0");
  const schema = generateZodSchema(initForm[0].data);

  if (id && id.trim() !== "") {
    // 🔄 Update
    const updateData: any = {
      name,
      email,
      address,
      phone,
      updateBy: userToken.email ?? "system",
      updateAt: new Date(),
    };
    let valid = validateWithZod(schema, updateData);
    if (!valid.success) {
      return { error: valid.error };
    }
    const updated = await prisma.company.update({
      where: { id: id },
      data: updateData,
    });

    return { success: "company updated", data: updated };
  } else {
    // ➕ Create
    const data = {
      name,
      email,
      address,
      phone,
      isActive: true,
      isDeleted: false,
      createBy: userToken.email ?? "system",
      updateBy: "-",
    };
    let valid = validateWithZod(schema, data);
    if (!valid.success) {
      return { error: valid.error };
    }
    const created = await prisma.company.create({
      data,
    });

    return { success: "Company created", data: created };
  }
}
