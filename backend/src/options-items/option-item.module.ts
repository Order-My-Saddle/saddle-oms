import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OptionItemService } from "./option-item.service";
import { OptionItemController } from "./option-item.controller";
import { OptionItemEntity } from "./infrastructure/persistence/relational/entities/option-item.entity";

@Module({
  imports: [TypeOrmModule.forFeature([OptionItemEntity])],
  controllers: [OptionItemController],
  providers: [OptionItemService],
  exports: [OptionItemService, TypeOrmModule],
})
export class OptionItemModule {}
