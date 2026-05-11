import { prisma } from "../prisma";
import NodeCache from "node-cache";

type CreateAuditLogParams = {
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
};
const myCache = new NodeCache({
  stdTTL: Number(process.env.NEXT_PUBLIC_CHACE_TIME),
}); //def 5min

export async function createAuditLog(data: CreateAuditLogParams) {
  try {
    // console.log("datadebug", data);
    return await prisma.auditlog.create({
      data,
    });
  } catch (error) {
    console.log("erroraja", error);
  }
}
export async function listAuditLogs() {
  return await prisma.auditlog.findMany({
    orderBy: { createdAt: "desc" },
  });
}
