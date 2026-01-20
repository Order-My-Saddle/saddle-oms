import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EnrichedOrdersController } from "./enriched-orders.controller";
import { EnrichedOrdersService } from "./enriched-orders.service";

@Module({
  imports: [
    // We'll use raw queries for the enriched orders view
    TypeOrmModule.forFeature([]),
  ],
  controllers: [EnrichedOrdersController],
  providers: [EnrichedOrdersService],
  exports: [EnrichedOrdersService],
})
export class EnrichedOrdersModule {}
