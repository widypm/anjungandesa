import { getMenuArryByModule } from "./checkPermission";
import { createAuditLog } from "./controller/auditLog";
import { getCachedMenuForlog } from "./controller/menu";

export async function logAccess({
  userId,
  user,
  ip,
  urlApi,
  urlFe,
  methodApi,
  bodyApi,
  menuId,
  menuLabel,
  pageId,
  PageLabel,
  createBy,
  updateBy,
  modulename,
}: {
  userId: number;
  user: string;
  ip: string;
  urlApi: string;
  urlFe: string;
  methodApi: string;
  bodyApi: string;
  menuId: number;
  menuLabel: string;
  pageId: number;
  PageLabel: string;
  createBy: string;
  updateBy: string;
  modulename: string;
}) {
  // Contoh logging ke console (ganti dengan kirim ke DB jika perlu)
  const menus = await getCachedMenuForlog(0);
  const menudat = getMenuArryByModule(menus, modulename);

  await createAuditLog({
    userId,
    user,
    ip,
    urlApi,
    urlFe,
    methodApi,
    bodyApi,
    menuId: menudat ? menudat.id : 0,
    menuLabel: menudat ? menudat.name : "-",
    pageId,
    PageLabel, // pakai huruf besar "P"
    createBy,
    updateBy,
  }).catch((err) => {
    console.warn("AuditLog fallback:", "data", err);
  });
}
