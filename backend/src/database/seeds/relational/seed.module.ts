import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DataSource, DataSourceOptions } from "typeorm";
import { TypeOrmConfigService } from "../../typeorm-config.service";
import databaseConfig from "../../config/database.config";
import appConfig from "../../../config/app.config";

/**
 * Seed Module
 *
 * This module is used for database seeding.
 * Production data is seeded via SQL scripts in production-data/postgres/scripts/.
 * See the README.md file in production-data/ for instructions.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: [".env"],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
  ],
})
export class SeedModule {}
