/*
  Warnings:

  - A unique constraint covering the columns `[point_id]` on the table `release_points` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "release_points" DROP CONSTRAINT "release_points_point_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "release_points_point_id_key" ON "release_points"("point_id");

-- AddForeignKey
ALTER TABLE "release_points" ADD CONSTRAINT "release_points_point_id_fkey" FOREIGN KEY ("point_id") REFERENCES "schema_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;
