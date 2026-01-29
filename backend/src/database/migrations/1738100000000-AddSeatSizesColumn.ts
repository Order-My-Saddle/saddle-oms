import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Add Seat Sizes Column Migration
 *
 * Adds the seat_sizes JSONB column to the orders table and creates
 * extraction functions to populate it from:
 * 1. orders_info table (primary source - option_id=1 is 'Seat Size')
 * 2. special_notes field (fallback - regex extraction)
 *
 * The seat_sizes column stores an array of seat sizes in European notation
 * (comma as decimal separator): ["17", "17,5"]
 *
 * Usage after migration:
 *   - Run extraction script: ./extract-seat-sizes.sh --apply
 *   - Or manually: SELECT get_seat_size_from_orders_info(id) FROM orders;
 */
export class AddSeatSizesColumn1738100000000 implements MigrationInterface {
  name = "AddSeatSizesColumn1738100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add seat_sizes column to orders table
    await queryRunner.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS seat_sizes JSONB DEFAULT NULL
    `);

    // Create index for JSONB containment queries
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_seat_sizes
      ON orders USING GIN (seat_sizes)
    `);

    // Create function to extract seat size from orders_info table
    // This is the PRIMARY source - option_id=1 is 'Seat Size'
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION get_seat_size_from_orders_info(p_order_id INTEGER)
      RETURNS JSONB AS $$
      DECLARE
          result TEXT[] := '{}';
          size_name TEXT;
      BEGIN
          -- Get seat size from orders_info (option_id = 1 is 'Seat Size')
          -- Join with options_items to get the actual size value
          FOR size_name IN
              SELECT oi2.name
              FROM orders_info oi
              JOIN options_items oi2 ON oi.option_item_id = oi2.id
              WHERE oi.order_id = p_order_id
                AND oi.option_id = 1
                AND oi2.option_id = 1
          LOOP
              IF size_name IS NOT NULL AND TRIM(size_name) != '' THEN
                  -- Normalize to European notation (comma decimal)
                  size_name := REPLACE(size_name, '.', ',');
                  IF NOT size_name = ANY(result) THEN
                      result := array_append(result, size_name);
                  END IF;
              END IF;
          END LOOP;

          IF array_length(result, 1) IS NULL OR array_length(result, 1) = 0 THEN
              RETURN NULL;
          END IF;

          RETURN to_jsonb(result);
      END;
      $$ LANGUAGE plpgsql STABLE;
    `);

    // Create function to extract seat size from special_notes (FALLBACK)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION extract_seat_sizes(notes TEXT)
      RETURNS JSONB AS $$
      DECLARE
          result TEXT[] := '{}';
          match_record RECORD;
          size_value TEXT;
          normalized_size TEXT;
      BEGIN
          IF notes IS NULL OR TRIM(notes) = '' THEN
              RETURN NULL;
          END IF;

          -- Pattern 1: "seat size X.X" or "seat size X"
          FOR match_record IN
              SELECT (regexp_matches(LOWER(notes), 'seat\\s*size[:\\s]+(\\d{1,2}(?:[.,]\\d)?)', 'gi'))[1] AS size
          LOOP
              size_value := match_record.size;
              normalized_size := REPLACE(size_value, '.', ',');
              IF NOT normalized_size = ANY(result) THEN
                  result := array_append(result, normalized_size);
              END IF;
          END LOOP;

          -- Pattern 2: "X.X seat" or "X seat" (not followed by "size")
          FOR match_record IN
              SELECT (regexp_matches(LOWER(notes), '(\\d{1,2}(?:[.,]\\d)?)\\s*seat(?!\\s*size)', 'gi'))[1] AS size
          LOOP
              size_value := match_record.size;
              normalized_size := REPLACE(size_value, '.', ',');
              IF NOT normalized_size = ANY(result) THEN
                  result := array_append(result, normalized_size);
              END IF;
          END LOOP;

          -- Pattern 3: X.X" or X.X inch (14-20 range for valid saddle sizes)
          FOR match_record IN
              SELECT (regexp_matches(notes, '(\\d{1,2}(?:[.,]\\d)?)\\s*(?:"|''''|inch)', 'gi'))[1] AS size
          LOOP
              size_value := match_record.size;
              BEGIN
                  IF REPLACE(size_value, ',', '.')::NUMERIC BETWEEN 14 AND 20 THEN
                      normalized_size := REPLACE(size_value, '.', ',');
                      IF NOT normalized_size = ANY(result) THEN
                          result := array_append(result, normalized_size);
                      END IF;
                  END IF;
              EXCEPTION WHEN OTHERS THEN
                  -- Ignore invalid numbers
              END;
          END LOOP;

          -- Pattern 4: "stamped X.X" (14-20 range)
          FOR match_record IN
              SELECT (regexp_matches(LOWER(notes), 'stamped(?:\\s+in)?\\s+(\\d{1,2}(?:[.,]\\d)?)', 'gi'))[1] AS size
          LOOP
              size_value := match_record.size;
              BEGIN
                  IF REPLACE(size_value, ',', '.')::NUMERIC BETWEEN 14 AND 20 THEN
                      normalized_size := REPLACE(size_value, '.', ',');
                      IF NOT normalized_size = ANY(result) THEN
                          result := array_append(result, normalized_size);
                      END IF;
                  END IF;
              EXCEPTION WHEN OTHERS THEN
                  -- Ignore invalid numbers
              END;
          END LOOP;

          IF array_length(result, 1) IS NULL OR array_length(result, 1) = 0 THEN
              RETURN NULL;
          END IF;

          RETURN to_jsonb(result);
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    `);

    // Add comment for documentation
    await queryRunner.query(`
      COMMENT ON COLUMN orders.seat_sizes IS
      'Seat sizes from orders_info (option_id=1) or special_notes. Format: ["17", "17,5"] (European decimal notation). Use extract-seat-sizes.sh to populate.'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_seat_sizes`);
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_seat_size_from_orders_info(INTEGER)`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS extract_seat_sizes(TEXT)`);
    await queryRunner.query(
      `ALTER TABLE orders DROP COLUMN IF EXISTS seat_sizes`,
    );
  }
}
