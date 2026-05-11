import { getCachedMenuForlog } from "../../lib/controller/menu";
import { NextRequest, NextResponse } from "next/server";
import { DebugLog } from "../../lib/helper";
import { createAuditLog } from "../../lib/controller/auditLog";
import { getMenuArryByModule } from "../../lib/checkPermission";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // console.log("dada", data);
    const menus = await getCachedMenuForlog(0);
    const menudat = getMenuArryByModule(menus, data.modulename);
    // console.log(data.modulename, menudat);
    data.menuId = menudat ? menudat.id : 0;
    data.menuLabel = menudat.name
      ? menudat.name
      : menudat.id
      ? data.modulename
      : "-";
    data.modulename = undefined;
    await createAuditLog(data);
    return NextResponse.json({ status: "logged" });
  } catch (error) {
    DebugLog(error);
    return NextResponse.json({ status: "unlogged" });
  }
}
