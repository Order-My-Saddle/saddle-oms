import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity } from "./entities/order.entity";
import { OrderRepository } from "./repositories/order.repository";
import { OrderMapper } from "./mappers/order.mapper";
import { ORDER_REPOSITORY } from "../../../domain/order.repository.token";

/**
 * Order Relational Persistence Module
 *
 * Provides TypeORM-based persistence infrastructure for orders
 */
@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  providers: [
    OrderMapper,
    {
      provide: ORDER_REPOSITORY,
      useClass: OrderRepository,
    },
  ],
  exports: [ORDER_REPOSITORY, OrderMapper],
})
export class OrderRelationalPersistenceModule {}
