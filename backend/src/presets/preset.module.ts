import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PresetService } from "./preset.service";
import { PresetController } from "./preset.controller";
import { PresetEntity } from "./infrastructure/persistence/relational/entities/preset.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PresetEntity])],
  controllers: [PresetController],
  providers: [PresetService],
  exports: [PresetService, TypeOrmModule],
})
export class PresetModule {}
