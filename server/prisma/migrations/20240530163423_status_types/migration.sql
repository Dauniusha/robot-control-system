/*
  Warnings:

  - Changed the type of `status` on the `operations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "robots" DROP CONSTRAINT "robots_status_id_fkey";

-- AlterTable
ALTER TABLE "operations" DROP COLUMN "status",
ADD COLUMN     "status" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "robots" ALTER COLUMN "status_id" SET DATA TYPE VARCHAR(30);

-- AddForeignKey
ALTER TABLE "robots" ADD CONSTRAINT "robots_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "workload_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
