import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SaddleExtraService } from "./saddle-extra.service";
import { SaddleExtraController } from "./saddle-extra.controller";
import { SaddleExtraEntity } from "./infrastructure/persistence/relational/entities/saddle-extra.entity";

@Module({
  imports: [TypeOrmModule.forFeature([SaddleExtraEntity])],
  controllers: [SaddleExtraController],
  providers: [SaddleExtraService],
  exports: [SaddleExtraService, TypeOrmModule],
})
export class SaddleExtraModule {}
