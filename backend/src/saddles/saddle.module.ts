import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SaddleService } from "./saddle.service";
import { SaddleController } from "./saddle.controller";
import { SaddleEntity } from "./infrastructure/persistence/relational/entities/saddle.entity";

@Module({
  imports: [TypeOrmModule.forFeature([SaddleEntity])],
  controllers: [SaddleController],
  providers: [SaddleService],
  exports: [SaddleService, TypeOrmModule],
})
export class SaddleModule {}
