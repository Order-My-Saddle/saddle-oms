import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExtraService } from "./extra.service";
import { ExtraController } from "./extra.controller";
import { ExtraEntity } from "./infrastructure/persistence/relational/entities/extra.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ExtraEntity])],
  controllers: [ExtraController],
  providers: [ExtraService],
  exports: [ExtraService, TypeOrmModule],
})
export class ExtraModule {}
