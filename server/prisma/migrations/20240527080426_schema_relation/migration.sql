-- CreateTable
CREATE TABLE "workload_statuses" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "order_position" INTEGER NOT NULL,

    CONSTRAINT "workload_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "robots" (
    "id" UUID NOT NULL,
    "status_id" VARCHAR(20) NOT NULL,
    "model" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "robots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operations" (
    "id" UUID NOT NULL,
    "robot_id" UUID NOT NULL,
    "schema_id" UUID NOT NULL,
    "status" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "done_at" TIMESTAMP(3),

    CONSTRAINT "operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path_points" (
    "id" UUID NOT NULL,
    "operation_id" UUID NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "target_point" BOOLEAN NOT NULL,
    "visit_number" INTEGER NOT NULL,

    CONSTRAINT "path_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schemas" (
    "id" UUID NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "assigned_robot_id" UUID,
    "rows" INTEGER NOT NULL,
    "columns" INTEGER NOT NULL,
    "robot_base_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "schemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schema_points" (
    "id" UUID NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "schema_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_points" (
    "id" UUID NOT NULL,
    "schema_id" UUID NOT NULL,
    "point_id" UUID NOT NULL,
    "webhook_url" VARCHAR(512) NOT NULL,

    CONSTRAINT "release_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barriers" (
    "schema_id" UUID NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "barriers_pkey" PRIMARY KEY ("schema_id","x","y")
);

-- CreateIndex
CREATE UNIQUE INDEX "workload_statuses_name_key" ON "workload_statuses"("name");

-- CreateIndex
CREATE INDEX "workload_statuses_order_position_idx" ON "workload_statuses"("order_position");

-- CreateIndex
CREATE INDEX "path_points_operation_id_idx" ON "path_points"("operation_id");

-- CreateIndex
CREATE UNIQUE INDEX "schemas_name_key" ON "schemas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "schema_points_name_key" ON "schema_points"("name");

-- CreateIndex
CREATE INDEX "release_points_schema_id_idx" ON "release_points"("schema_id");

-- CreateIndex
CREATE INDEX "barriers_schema_id_idx" ON "barriers"("schema_id");

-- AddForeignKey
ALTER TABLE "robots" ADD CONSTRAINT "robots_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "workload_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_robot_id_fkey" FOREIGN KEY ("robot_id") REFERENCES "robots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operations" ADD CONSTRAINT "operations_schema_id_fkey" FOREIGN KEY ("schema_id") REFERENCES "schemas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_points" ADD CONSTRAINT "path_points_operation_id_fkey" FOREIGN KEY ("operation_id") REFERENCES "operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schemas" ADD CONSTRAINT "schemas_robot_base_id_fkey" FOREIGN KEY ("robot_base_id") REFERENCES "schema_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_points" ADD CONSTRAINT "release_points_schema_id_fkey" FOREIGN KEY ("schema_id") REFERENCES "schemas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_points" ADD CONSTRAINT "release_points_point_id_fkey" FOREIGN KEY ("point_id") REFERENCES "schema_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barriers" ADD CONSTRAINT "barriers_schema_id_fkey" FOREIGN KEY ("schema_id") REFERENCES "schemas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
