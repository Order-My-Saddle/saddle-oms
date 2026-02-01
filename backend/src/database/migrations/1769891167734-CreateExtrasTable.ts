import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateExtrasTable1769891167734 implements MigrationInterface {
  name = "CreateExtrasTable1769891167734";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "extras" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "description" text,
        "price1" integer NOT NULL DEFAULT 0,
        "price2" integer NOT NULL DEFAULT 0,
        "price3" integer NOT NULL DEFAULT 0,
        "price4" integer NOT NULL DEFAULT 0,
        "price5" integer NOT NULL DEFAULT 0,
        "price6" integer NOT NULL DEFAULT 0,
        "price7" integer NOT NULL DEFAULT 0,
        "sequence" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_extras" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "extra_name_index" ON "extras" ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."extra_name_index"`);
    await queryRunner.query(`DROP TABLE "extras"`);
  }
}
