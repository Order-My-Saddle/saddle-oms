import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLogTable1769900000000 implements MigrationInterface {
  name = "CreateAuditLogTable1769900000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_log" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "user_type" INTEGER NOT NULL DEFAULT 0,
        "order_id" INTEGER,
        "action" TEXT NOT NULL DEFAULT '',
        "order_status_from" INTEGER,
        "order_status_to" INTEGER,
        "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_log_user_id_timestamp" ON "audit_log" ("user_id", "timestamp")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_log_order_id" ON "audit_log" ("order_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_log_timestamp" ON "audit_log" ("timestamp")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_log_action" ON "audit_log" ("action")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_log_user_type" ON "audit_log" ("user_type")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_log_status_change" ON "audit_log" ("order_status_from", "order_status_to")`,
    );

    console.log(
      "✅ audit_log table created with indexes",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_log"`);
  }
}
