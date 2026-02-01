import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntityFieldsToAuditLog1770000000000
  implements MigrationInterface
{
  name = "AddEntityFieldsToAuditLog1770000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "audit_log" ADD COLUMN "entity_type" VARCHAR(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_log" ADD COLUMN "entity_id" VARCHAR(100)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_audit_log_entity" ON "audit_log" ("entity_type", "entity_id")`,
    );
    console.log(
      "Added entity_type and entity_id columns to audit_log with index",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_audit_log_entity"`);
    await queryRunner.query(
      `ALTER TABLE "audit_log" DROP COLUMN IF EXISTS "entity_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_log" DROP COLUMN IF EXISTS "entity_type"`,
    );
  }
}
