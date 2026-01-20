import { Module } from "@nestjs/common";
import { FactoryEmployeeService } from "./factory-employee.service";
import { FactoryEmployeeController } from "./factory-employee.controller";
import { FactoryEmployeeRelationalPersistenceModule } from "./infrastructure/persistence/relational/relational-persistence.module";
import { FactoryEmployeeDtoMapper } from "./mappers/factory-employee-dto.mapper";

/**
 * Factory Employee Module
 *
 * Orchestrates all factory employee-related functionality following hexagonal architecture.
 * Manages the employees working at specific factories in the saddle manufacturing system.
 */
@Module({
  imports: [FactoryEmployeeRelationalPersistenceModule],
  controllers: [FactoryEmployeeController],
  providers: [FactoryEmployeeService, FactoryEmployeeDtoMapper],
  exports: [FactoryEmployeeService, FactoryEmployeeDtoMapper],
})
export class FactoryEmployeeModule {}
