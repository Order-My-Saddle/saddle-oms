import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * CreateWarehouseTable Migration
 *
 * Creates the warehouse table for warehouse management.
 * Matches the Warehouse entity defined in src/warehouses/warehouse.entity.ts.
 */
export class CreateWarehouseTable1738300000000 implements MigrationInterface {
  name = "CreateWarehouseTable1738300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "warehouse" (
        "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "code" VARCHAR(50),
        "address" VARCHAR(255),
        "city" VARCHAR(100),
        "state" VARCHAR(100),
        "postal_code" VARCHAR(20),
        "country" VARCHAR(100),
        "phone" VARCHAR(50),
        "email" VARCHAR(255),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_warehouse" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_warehouse_code" ON "warehouse" ("code") WHERE "code" IS NOT NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_warehouse_name" ON "warehouse" ("name")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_warehouse_is_active" ON "warehouse" ("is_active")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_warehouse_deleted_at" ON "warehouse" ("deleted_at")`,
    );

    console.log("✅ Warehouse table created with indexes");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_warehouse_deleted_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_warehouse_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_warehouse_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_warehouse_code"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "warehouse"`);

    console.log("✅ Warehouse table removed");
  }
}
