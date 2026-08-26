import 'server-only';
import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * Equivalente ao `PrismaService` do PDF: centraliza a criação do PrismaClient
 * com o driver adapter. Em Next.js não existe injeção de dependência por módulo,
 * então a instância é um singleton — o cache em `globalThis` evita que o
 * hot reload do `next dev` abra uma conexão nova a cada recompilação.
 */
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL não definida');

  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
