import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderProductSaddleEntity } from "./infrastructure/persistence/relational/entities/order-product-saddle.entity";
import { OrderProductSaddleController } from "./order-product-saddle.controller";
import { OrderProductSaddleService } from "./order-product-saddle.service";

/**
 * OrderProductSaddle Module
 *
 * Manages the relationships between orders and products (saddles).
 * Provides functionality for linking products to orders with configuration,
 * quantity, and product-specific details.
 */
@Module({
  imports: [TypeOrmModule.forFeature([OrderProductSaddleEntity])],
  controllers: [OrderProductSaddleController],
  providers: [OrderProductSaddleService],
  exports: [OrderProductSaddleService],
})
export class OrderProductSaddleModule {}
