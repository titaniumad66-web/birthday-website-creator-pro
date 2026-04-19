ALTER TABLE "websites" ADD COLUMN IF NOT EXISTS "unlock_at" timestamp;
ALTER TABLE "websites" ADD COLUMN IF NOT EXISTS "early_unlocked" boolean DEFAULT false NOT NULL;
