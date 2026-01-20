import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CountryManagerEntity } from "./entities/country-manager.entity";
import { CountryManagerRepository } from "./repositories/country-manager.repository";

@Module({
  imports: [TypeOrmModule.forFeature([CountryManagerEntity])],
  providers: [CountryManagerRepository],
  exports: [CountryManagerRepository],
})
export class CountryManagerRelationalPersistenceModule {}
