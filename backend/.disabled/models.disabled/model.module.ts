import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ModelService } from "./model.service";
import { ModelController } from "./model.controller";
import { ModelEntity } from "./infrastructure/persistence/relational/entities/model.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ModelEntity])],
  controllers: [ModelController],
  providers: [ModelService],
  exports: [ModelService, TypeOrmModule],
})
export class ModelModule {}
