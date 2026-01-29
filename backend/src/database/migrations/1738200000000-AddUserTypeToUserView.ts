import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * AddUserTypeToUserView Migration
 *
 * Updates the "user" view to include user_type and supervisor columns
 * from the credentials table. These columns are needed for proper role
 * determination instead of using hardcoded username patterns.
 *
 * Database user_type values:
 * - 1: fitter
 * - 2: admin
 * - 3: factory
 * - 4: customsaddler
 *
 * supervisor column:
 * - 0: not a supervisor
 * - 1: is a supervisor
 */
export class AddUserTypeToUserView1738200000000 implements MigrationInterface {
  name = "AddUserTypeToUserView1738200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing view
    await queryRunner.query(`DROP VIEW IF EXISTS "user"`);

    // Recreate view with user_type and supervisor columns
    await queryRunner.query(`
      CREATE VIEW "user" AS
      SELECT
        uuid_generate_v5(uuid_ns_oid(), user_id::text) AS id,
        user_id AS legacy_id,
        last_login,
        user_name AS username,
        password_hash AS password,
        password_reset_hash AS reset_token,
        password_reset_valid_to AS reset_token_expires_at,
        (blocked = 0) AS enabled,
        NULL::varchar AS email,
        NULL::varchar AS address,
        NULL::varchar AS city,
        NULL::varchar AS zipcode,
        NULL::varchar AS state,
        NULL::varchar AS cell_no,
        NULL::varchar AS phone_no,
        NULL::varchar AS country,
        'USD'::varchar AS currency,
        full_name AS name,
        user_type,
        supervisor AS is_supervisor,
        CURRENT_TIMESTAMP AS created_at,
        CURRENT_TIMESTAMP AS updated_at,
        CASE WHEN deleted = 1 THEN CURRENT_TIMESTAMP ELSE NULL END AS deleted_at
      FROM credentials
    `);

    console.log(
      "✅ User view updated with user_type and supervisor columns",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the updated view
    await queryRunner.query(`DROP VIEW IF EXISTS "user"`);

    // Recreate original view without user_type and supervisor
    await queryRunner.query(`
      CREATE VIEW "user" AS
      SELECT
        uuid_generate_v5(uuid_ns_oid(), user_id::text) AS id,
        last_login,
        user_name AS username,
        password_hash AS password,
        password_reset_hash AS reset_token,
        password_reset_valid_to AS reset_token_expires_at,
        (blocked = 0) AS enabled,
        NULL::varchar AS email,
        NULL::varchar AS address,
        NULL::varchar AS city,
        NULL::varchar AS zipcode,
        NULL::varchar AS state,
        NULL::varchar AS cell_no,
        NULL::varchar AS phone_no,
        NULL::varchar AS country,
        'USD'::varchar AS currency,
        full_name AS name,
        CURRENT_TIMESTAMP AS created_at,
        CURRENT_TIMESTAMP AS updated_at,
        CASE WHEN deleted = 1 THEN CURRENT_TIMESTAMP ELSE NULL END AS deleted_at
      FROM credentials
    `);

    console.log(
      "✅ User view reverted to original without user_type and supervisor columns",
    );
  }
}
