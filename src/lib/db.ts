import { PrismaClient } from '@prisma/client'

// Explicitly load .env file to ensure environment variables are available
// at runtime, even when the system overrides DATABASE_URL with a SQLite path.
// This MUST run before any env var reads.
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaDatasourceUrl: string | undefined
}

// Resolve the correct PostgreSQL URL for Prisma at runtime.
// Priority:
//   1. POSTGRES_URL env var (dedicated var, avoids system DATABASE_URL conflicts)
//   2. DATABASE_URL env var — only if it starts with postgresql:// or postgres://
//   3. Fallback: no datasource override (Prisma uses schema default, which may fail)
//
// This is necessary because the sandbox system may set DATABASE_URL to a SQLite
// file path (file:./db/custom.db), which conflicts with the PostgreSQL provider
// in the Prisma schema and causes "URL must start with postgresql://" errors.
function resolveDatabaseUrl(): string | undefined {
  const postgresUrl = process.env.POSTGRES_URL
  if (postgresUrl && (postgresUrl.startsWith('postgresql://') || postgresUrl.startsWith('postgres://'))) {
    return postgresUrl
  }

  const databaseUrl = process.env.DATABASE_URL
  if (databaseUrl && (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
    return databaseUrl
  }

  console.error(
    '[DB] WARNING: No valid PostgreSQL URL found. ' +
    'POSTGRES_URL and DATABASE_URL are either missing or not PostgreSQL URLs. ' +
    `POSTGRES_URL=${postgresUrl ? postgresUrl.substring(0, 30) + '...' : 'unset'}, ` +
    `DATABASE_URL=${databaseUrl ? databaseUrl.substring(0, 30) + '...' : 'unset'}`
  )
  return undefined
}

const datasourceUrl = resolveDatabaseUrl()

// If the datasourceUrl changed (e.g., after HMR or env update), discard the
// cached PrismaClient so a fresh one is created with the new URL.
if (globalForPrisma.prisma && globalForPrisma.prismaDatasourceUrl !== datasourceUrl) {
  console.log('[DB] Datasource URL changed, creating new PrismaClient')
  globalForPrisma.prisma = undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    ...(datasourceUrl ? { datasourceUrl } : {}),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
  globalForPrisma.prismaDatasourceUrl = datasourceUrl
}
