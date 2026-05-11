// lib/prisma.ts
import path from "path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;

  if (!rawUrl || !rawUrl.startsWith("file:")) {
    return rawUrl;
  }

  const filePath = rawUrl.slice(5);

  if (!filePath || path.isAbsolute(filePath)) {
    return rawUrl;
  }

  return `file:${path.resolve(process.cwd(), filePath).replace(/\\/g, "/")}`;
}

const databaseUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: databaseUrl
      ? {
          db: {
            url: databaseUrl,
          },
        }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
