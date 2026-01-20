import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FactoryEmployeeEntity } from "./entities/factory-employee.entity";
import { FactoryEmployeeRepository } from "./repositories/factory-employee.repository";

/**
 * Factory Employee Relational Persistence Module
 *
 * Configures TypeORM entities and repositories for factory employees
 */
@Module({
  imports: [TypeOrmModule.forFeature([FactoryEmployeeEntity])],
  providers: [
    {
      provide: "FactoryEmployeeRepository",
      useClass: FactoryEmployeeRepository,
    },
  ],
  exports: ["FactoryEmployeeRepository"],
})
export class FactoryEmployeeRelationalPersistenceModule {}
