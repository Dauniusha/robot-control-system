-- AddForeignKey
ALTER TABLE "schemas" ADD CONSTRAINT "schemas_assigned_robot_id_fkey" FOREIGN KEY ("assigned_robot_id") REFERENCES "robots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
