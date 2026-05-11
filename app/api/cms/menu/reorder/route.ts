import { GetDecrypt } from "../../../../lib/helper";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { ResponseHttp } from "../../../../lib/response";

export async function POST(req: Request) {
  const bodyText = await req.text();
  const rawBody = JSON.parse(GetDecrypt(bodyText));
  const { draggedId, targetId } = rawBody;

  if (!draggedId || !targetId) {
    const respon = ResponseHttp(400, "Invalid input", {});
    const response = new NextResponse(respon, {
      status: 400,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }

  // Ambil semua data dari DB yang relevan
  const items = await prisma.menu.findMany({
    orderBy: { order: "asc" },
    select: { id: true, parentId: true, order: true },
  });

  const draggedIndex = items.findIndex((i) => i.id === draggedId);
  const targetIndex = items.findIndex((i) => i.id === targetId);

  if (draggedIndex === -1 || targetIndex === -1) {
    const respon = ResponseHttp(404, "Item not found", {});
    const response = new NextResponse(respon, {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
    return response;
  }

  const reordered = [...items];
  const [moved] = reordered.splice(draggedIndex, 1);
  reordered.splice(targetIndex, 0, moved);

  // Update ulang order-nya
  const updatePromises = reordered.map((item, index) =>
    prisma.menu.update({
      where: { id: item.id },
      data: { order: index },
    })
  );

  await Promise.all(updatePromises);

  const respon = ResponseHttp(200, "result.success", {});
  const response = new NextResponse(respon, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
  return response;
}
