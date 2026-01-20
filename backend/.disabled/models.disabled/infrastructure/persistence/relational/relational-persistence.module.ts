import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ModelEntity } from "./entities/model.entity";
import { ModelRepository } from "./repositories/model.repository";
import { ModelMapper } from "./mappers/model.mapper";
import { IModelRepository } from "../../../domain/model.repository";

@Module({
  imports: [TypeOrmModule.forFeature([ModelEntity])],
  providers: [
    {
      provide: IModelRepository,
      useClass: ModelRepository,
    },
    ModelMapper,
  ],
  exports: [IModelRepository, ModelMapper],
})
export class ModelRelationalPersistenceModule {}
