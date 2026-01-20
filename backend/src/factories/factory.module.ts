import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FactoryService } from "./factory.service";
import { FactoryController } from "./factory.controller";
import { FactoryEntity } from "./infrastructure/persistence/relational/entities/factory.entity";

/**
 * Factory Module
 *
 * Manages factory-related functionality with simplified architecture.
 * Uses TypeORM repository directly for data access.
 */
@Module({
  imports: [TypeOrmModule.forFeature([FactoryEntity])],
  controllers: [FactoryController],
  providers: [FactoryService],
  exports: [FactoryService],
})
export class FactoryModule {}
