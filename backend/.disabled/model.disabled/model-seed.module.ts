import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ModelEntity } from "../../../../../../models/infrastructure/persistence/relational/entities/model.entity";
import { ModelSeedService } from "./model-seed.service";

@Module({
  imports: [TypeOrmModule.forFeature([ModelEntity])],
  providers: [ModelSeedService],
  exports: [ModelSeedService],
})
export class ModelSeedModule {}
