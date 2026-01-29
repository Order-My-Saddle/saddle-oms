import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Create Role Table Migration
 *
 * Creates the role table used by NestJS backend for authorization.
 * Role IDs are aligned with production user_types table:
 *   - fitter = 1 (UserTypeID 1)
 *   - admin = 2 (UserTypeID 2)
 *   - factory = 3 (UserTypeID 3)
 *   - customsaddler = 4 (UserTypeID 4)
 *   - supervisor = 5 (extended)
 *   - user = 6 (extended)
 */
export class CreateRoleTable1738000000000 implements MigrationInterface {
  name = "CreateRoleTable1738000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create role table (used by NestJS backend)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "role" (
        "id" INTEGER PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL
      )
    `);

    // Insert roles aligned with production user_types + extended roles
    // This ensures role IDs match between legacy system and new backend
    await queryRunner.query(`
      INSERT INTO "role" (id, name) VALUES
        (1, 'fitter'),
        (2, 'admin'),
        (3, 'factory'),
        (4, 'customsaddler'),
        (5, 'supervisor'),
        (6, 'user')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    `);

    // Create index on role name for lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_role_name" ON "role" ("name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_role_name"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role"`);
  }
}
