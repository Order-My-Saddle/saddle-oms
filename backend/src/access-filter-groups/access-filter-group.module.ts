import { Module } from "@nestjs/common";
import { AccessFilterGroupService } from "./access-filter-group.service";
import { AccessFilterGroupController } from "./access-filter-group.controller";
import { AccessFilterGroupRelationalPersistenceModule } from "./infrastructure/persistence/relational/relational-persistence.module";

@Module({
  imports: [AccessFilterGroupRelationalPersistenceModule],
  controllers: [AccessFilterGroupController],
  providers: [AccessFilterGroupService],
  exports: [AccessFilterGroupService],
})
export class AccessFilterGroupModule {}
