import { Module } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
// import { CustomerResolver } from './infrastructure/graphql/customer.resolver';
import { CustomerRelationalPersistenceModule } from "./infrastructure/persistence/relational/relational-persistence.module";
import { CustomerMapper } from "./mappers/customer-dto.mapper";

/**
 * Customer Module
 *
 * Orchestrates all customer-related functionality following hexagonal architecture
 */
@Module({
  imports: [CustomerRelationalPersistenceModule],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    // CustomerResolver, // TODO: Enable when GraphQL is integrated
    CustomerMapper,
  ],
  exports: [CustomerService, CustomerMapper],
})
export class CustomerModule {}
