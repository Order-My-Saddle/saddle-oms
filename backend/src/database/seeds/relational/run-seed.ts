import { NestFactory } from "@nestjs/core";
import { SeedModule } from "./seed.module";

/**
 * Run Seed
 *
 * This script initializes the database seeding process.
 * Production data is seeded via SQL scripts in production-data/postgres/scripts/.
 *
 * To seed the database:
 * 1. Start the PostgreSQL container: ./production-data/postgres/scripts/setup-postgres.sh
 * 2. Transform MySQL data (first time): ./production-data/postgres/scripts/transform-mysql-to-postgres.sh
 * 3. Import all data: ./production-data/postgres/scripts/import-data.sh
 * 4. Validate the import: ./production-data/postgres/scripts/validate-data.sh
 *
 * See the README.md file in production-data/ for detailed instructions.
 */
const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  console.log("🌱 Seed module initialized.\n");
  console.log("📋 To seed production data, use the SQL scripts:");
  console.log("   cd src/database/seeds/relational/production-data/postgres/scripts");
  console.log("   ./setup-postgres.sh      # Start PostgreSQL container");
  console.log("   ./transform-mysql-to-postgres.sh  # Transform data (first time)");
  console.log("   ./import-data.sh         # Import all schema and data");
  console.log("   ./validate-data.sh       # Validate the import");
  console.log("\n📊 See production-data/README.md for full documentation.\n");

  await app.close();
};

void runSeed();
