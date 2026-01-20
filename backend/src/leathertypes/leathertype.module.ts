import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LeathertypeService } from "./leathertype.service";
import { LeathertypeController } from "./leathertype.controller";
import { LeathertypeEntity } from "./infrastructure/persistence/relational/entities/leathertype.entity";

@Module({
  imports: [TypeOrmModule.forFeature([LeathertypeEntity])],
  controllers: [LeathertypeController],
  providers: [LeathertypeService],
  exports: [LeathertypeService, TypeOrmModule],
})
export class LeathertypeModule {}
