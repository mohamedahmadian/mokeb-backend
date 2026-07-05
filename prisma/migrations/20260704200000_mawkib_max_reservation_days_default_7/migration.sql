-- Default max reservation span: one week (7 days). Default stay length remains 1 day.
ALTER TABLE "mawkibs" ALTER COLUMN "maxReservationDays" SET DEFAULT 7;
