/*
Warnings:

- A unique constraint covering the columns `[robot_base_id]` on the table `schemas` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[base_webhook_url]` on the table `schemas` will be added. If there are existing duplicate values, this will fail.
- Added the required column `base_webhook_url` to the `schemas` table without a default value. This is not possible if the table is not empty.
*/

-- Add the base_webhook_url column as nullable
ALTER TABLE "schemas" ADD COLUMN IF NOT EXISTS "base_webhook_url" VARCHAR(512);

-- Update existing records to fill base_webhook_url with a default value
UPDATE "schemas"
SET "base_webhook_url" = 'http://localhost:3000/point'
WHERE "base_webhook_url" IS NULL OR "base_webhook_url" = '';

-- Make the base_webhook_url column NOT NULL
ALTER TABLE "schemas" ALTER COLUMN "base_webhook_url" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "schemas_robot_base_id_key" ON "schemas"("robot_base_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "schemas_base_webhook_url_key" ON "schemas"("base_webhook_url");
