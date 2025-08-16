import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"], // 👈 sẽ thấy UPDATE/SELECT trong terminal
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
