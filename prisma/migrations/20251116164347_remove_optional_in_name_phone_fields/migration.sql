/*
  Warnings:

  - Made the column `formName` on table `Booking` required. This step will fail if there are existing NULL values in that column.
  - Made the column `formPhone` on table `Booking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "formName" SET NOT NULL,
ALTER COLUMN "formPhone" SET NOT NULL;
