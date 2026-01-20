import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BrandEntity } from "./entities/brand.entity";
import { BrandRepository } from "./repositories/brand.repository";
import { BrandMapper } from "./mappers/brand.mapper";
import { IBrandRepository } from "../../../domain/brand.repository";

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity])],
  providers: [
    {
      provide: IBrandRepository,
      useClass: BrandRepository,
    },
    BrandMapper,
  ],
  exports: [IBrandRepository, BrandMapper],
})
export class BrandRelationalPersistenceModule {}
