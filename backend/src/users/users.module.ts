import {
  // common
  Module,
} from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UsersController } from "./users.controller";

import { UsersService } from "./users.service";
import { RelationalUserPersistenceModule } from "./infrastructure/persistence/relational/relational-persistence.module";
import { FilesModule } from "../files/files.module";
import { FitterEntity } from "../fitters/infrastructure/persistence/relational/entities/fitter.entity";
import { RoleEntity } from "../roles/infrastructure/persistence/relational/entities/role.entity";

const infrastructurePersistenceModule = RelationalUserPersistenceModule;

@Module({
  imports: [
    // import modules, etc.
    infrastructurePersistenceModule,
    FilesModule,
    TypeOrmModule.forFeature([FitterEntity, RoleEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, infrastructurePersistenceModule],
})
export class UsersModule {}
