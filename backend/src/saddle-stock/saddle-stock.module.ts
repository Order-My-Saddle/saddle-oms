import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SaddleStockController } from "./saddle-stock.controller";
import { SaddleStockService } from "./saddle-stock.service";

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [SaddleStockController],
  providers: [SaddleStockService],
  exports: [SaddleStockService],
})
export class SaddleStockModule {}
