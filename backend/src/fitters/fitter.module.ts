import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FitterService } from "./fitter.service";
import { FitterController } from "./fitter.controller";
import { FitterEntity } from "./infrastructure/persistence/relational/entities/fitter.entity";
import { UserEntity } from "../users/infrastructure/persistence/relational/entities/user.entity";

/**
 * Fitter Module
 *
 * Manages fitter-related functionality with simplified architecture.
 * Uses TypeORM repository directly for data access.
 */
@Module({
  imports: [TypeOrmModule.forFeature([FitterEntity, UserEntity])],
  controllers: [FitterController],
  providers: [FitterService],
  exports: [FitterService],
})
export class FitterModule {}
