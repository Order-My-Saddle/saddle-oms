import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SaddleLeatherService } from "./saddle-leather.service";
import { SaddleLeatherController } from "./saddle-leather.controller";
import { SaddleLeatherEntity } from "./infrastructure/persistence/relational/entities/saddle-leather.entity";

@Module({
  imports: [TypeOrmModule.forFeature([SaddleLeatherEntity])],
  controllers: [SaddleLeatherController],
  providers: [SaddleLeatherService],
  exports: [SaddleLeatherService, TypeOrmModule],
})
export class SaddleLeatherModule {}
