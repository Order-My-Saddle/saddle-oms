import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SaddleOptionsItemService } from "./saddle-options-item.service";
import { SaddleOptionsItemController } from "./saddle-options-item.controller";
import { SaddleOptionsItemEntity } from "./infrastructure/persistence/relational/entities/saddle-options-item.entity";

@Module({
  imports: [TypeOrmModule.forFeature([SaddleOptionsItemEntity])],
  controllers: [SaddleOptionsItemController],
  providers: [SaddleOptionsItemService],
  exports: [SaddleOptionsItemService, TypeOrmModule],
})
export class SaddleOptionsItemModule {}
