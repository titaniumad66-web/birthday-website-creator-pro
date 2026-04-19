import { pool } from "./db";

/**
 * Ensures `websites` has scheduled-unlock columns (matches migrations/0003_website_unlock.sql).
 * Safe to run repeatedly (IF NOT EXISTS). Call on startup and optionally after column-related errors.
 */
export async function ensureWebsiteUnlockColumns(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      `ALTER TABLE "websites" ADD COLUMN IF NOT EXISTS "unlock_at" timestamp`,
    );
    await client.query(
      `ALTER TABLE "websites" ADD COLUMN IF NOT EXISTS "early_unlocked" boolean DEFAULT false NOT NULL`,
    );
  } finally {
    client.release();
  }
}

export function isMissingWebsiteColumnError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  if (!/\b(does not exist|undefined column)\b/i.test(msg)) return false;
  return /\bunlock_at\b|\bearly_unlocked\b/i.test(msg);
}
