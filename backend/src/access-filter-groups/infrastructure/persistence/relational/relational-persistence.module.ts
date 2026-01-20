import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccessFilterGroupEntity } from "./entities/access-filter-group.entity";
import { AccessFilterGroupRepository } from "./repositories/access-filter-group.repository";

@Module({
  imports: [TypeOrmModule.forFeature([AccessFilterGroupEntity])],
  providers: [AccessFilterGroupRepository],
  exports: [AccessFilterGroupRepository],
})
export class AccessFilterGroupRelationalPersistenceModule {}
