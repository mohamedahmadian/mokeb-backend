-- AlterTable
ALTER TABLE "users" ADD COLUMN "servantOwnerUserId" INTEGER;
ALTER TABLE "users" ADD COLUMN "servantAllMawkibsAccess" BOOLEAN NOT NULL DEFAULT false;

-- Backfill owner link and selected mawkib access from legacy single-mawkib assignment
UPDATE "users" u
SET "servantOwnerUserId" = m."ownerUserId"
FROM "mawkibs" m
WHERE u."servantMawkibId" = m.id;

CREATE TABLE "mawkib_servant_access" (
    "servantUserId" INTEGER NOT NULL,
    "mawkibId" INTEGER NOT NULL,

    CONSTRAINT "mawkib_servant_access_pkey" PRIMARY KEY ("servantUserId","mawkibId")
);

INSERT INTO "mawkib_servant_access" ("servantUserId", "mawkibId")
SELECT "id", "servantMawkibId" FROM "users" WHERE "servantMawkibId" IS NOT NULL;

ALTER TABLE "mawkib_servant_access" ADD CONSTRAINT "mawkib_servant_access_servantUserId_fkey" FOREIGN KEY ("servantUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mawkib_servant_access" ADD CONSTRAINT "mawkib_servant_access_mawkibId_fkey" FOREIGN KEY ("mawkibId") REFERENCES "mawkibs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users" ADD CONSTRAINT "users_servantOwnerUserId_fkey" FOREIGN KEY ("servantOwnerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "users_servantOwnerUserId_idx" ON "users"("servantOwnerUserId");
