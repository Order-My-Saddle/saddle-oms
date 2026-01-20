import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WarehouseEntity } from "./entities/warehouse.entity";
import { WarehouseRepository } from "./repositories/warehouse.repository";
import { WarehouseMapper } from "./mappers/warehouse.mapper";
import { WAREHOUSE_REPOSITORY } from "../../../domain/warehouse.repository.token";

/**
 * Warehouse Relational Persistence Module
 *
 * Provides TypeORM-based persistence infrastructure for warehouses
 */
@Module({
  imports: [TypeOrmModule.forFeature([WarehouseEntity])],
  providers: [
    WarehouseMapper,
    {
      provide: WAREHOUSE_REPOSITORY,
      useClass: WarehouseRepository,
    },
  ],
  exports: [WAREHOUSE_REPOSITORY, WarehouseMapper],
})
export class WarehouseRelationalPersistenceModule {}
