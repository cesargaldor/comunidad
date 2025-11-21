-- CreateEnum
CREATE TYPE "PollStatus" AS ENUM ('ACTIVE', 'FINISHED');

-- AlterTable
ALTER TABLE "poll" ADD COLUMN     "status" "PollStatus" NOT NULL DEFAULT 'ACTIVE';
