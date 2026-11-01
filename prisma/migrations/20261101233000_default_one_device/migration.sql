-- AlterTable
ALTER TABLE "User" ALTER COLUMN "maxDevices" SET DEFAULT 1;

-- Update existing students to 1 device by default
UPDATE "User" SET "maxDevices" = 1 WHERE "role" = 'STUDENT';

