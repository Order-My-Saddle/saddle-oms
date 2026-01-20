import { Module } from "@nestjs/common";
import { CountryManagerService } from "./country-manager.service";
import { CountryManagerController } from "./country-manager.controller";
import { CountryManagerRelationalPersistenceModule } from "./infrastructure/persistence/relational/relational-persistence.module";

/**
 * Country Manager Module
 *
 * Orchestrates all country manager related functionality
 */
@Module({
  imports: [CountryManagerRelationalPersistenceModule],
  controllers: [CountryManagerController],
  providers: [CountryManagerService],
  exports: [CountryManagerService],
})
export class CountryManagerModule {}
