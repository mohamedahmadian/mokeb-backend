-- درخواست‌های نیاز خادم ثبت‌شده توسط موکب‌دار بلافاصله در لیست عمومی منتشر می‌شوند
UPDATE "honorary_volunteer_applications"
SET
  "status" = 'Approved',
  "reviewedAt" = COALESCE("reviewedAt", NOW()),
  "reviewedByUserId" = COALESCE("reviewedByUserId", "submittedByUserId")
WHERE "applicantType" = 'MawkibOwner'
  AND "status" = 'Pending';
