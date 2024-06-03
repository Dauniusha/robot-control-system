/*
  Warnings:

  - A unique constraint covering the columns `[serial_number]` on the table `robots` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serial_number` to the `robots` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "robots" ADD COLUMN     "serial_number" VARCHAR(30) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "robots_serial_number_key" ON "robots"("serial_number");

-- CreateIndex
CREATE INDEX "robots_serial_number_idx" ON "robots"("serial_number");
