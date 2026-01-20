import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderLineService } from "./order-line.service";
import { OrderLineController } from "./order-line.controller";
import { OrderLineEntity } from "./infrastructure/persistence/relational/entities/order-line.entity";

/**
 * OrderLine Module
 *
 * Provides order line item management functionality.
 * Handles individual line items within orders including products,
 * quantities, pricing, and sequencing.
 */
@Module({
  imports: [TypeOrmModule.forFeature([OrderLineEntity])],
  controllers: [OrderLineController],
  providers: [OrderLineService],
  exports: [OrderLineService],
})
export class OrderLineModule {}
