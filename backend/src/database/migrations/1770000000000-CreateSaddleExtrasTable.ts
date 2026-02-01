import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSaddleExtrasTable1770000000000
  implements MigrationInterface
{
  name = "CreateSaddleExtrasTable1770000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "saddle_extras" (
        "id" SERIAL PRIMARY KEY,
        "saddle_id" INTEGER NOT NULL,
        "extra_id" INTEGER NOT NULL,
        "deleted" SMALLINT NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_saddle_extras_saddle_id" ON "saddle_extras" ("saddle_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_saddle_extras_extra_id" ON "saddle_extras" ("extra_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "saddle_extras"`);
  }
}
