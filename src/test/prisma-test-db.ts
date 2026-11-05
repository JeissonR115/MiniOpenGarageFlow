import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

export function createPrismaTestDatabase(prefix: string) {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  const databaseUrl = `file:${join(directory, "test.db")}`;
  execFileSync("./node_modules/.bin/prisma", ["db", "push", `--url=${databaseUrl}`], {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "pipe",
  });

  const db = new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
  });

  return {
    db,
    async cleanup() {
      await db.$disconnect();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}
