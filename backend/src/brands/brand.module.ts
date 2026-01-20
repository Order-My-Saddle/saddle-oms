import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BrandService } from "./brand.service";
import { BrandController } from "./brand.controller";
import { BrandEntity } from "./infrastructure/persistence/relational/entities/brand.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity])],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService, TypeOrmModule],
})
export class BrandModule {}
