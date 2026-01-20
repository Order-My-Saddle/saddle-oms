import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OptionService } from "./option.service";
import { OptionController } from "./option.controller";
import { OptionEntity } from "./infrastructure/persistence/relational/entities/option.entity";

@Module({
  imports: [TypeOrmModule.forFeature([OptionEntity])],
  controllers: [OptionController],
  providers: [OptionService],
  exports: [OptionService, TypeOrmModule],
})
export class OptionModule {}
