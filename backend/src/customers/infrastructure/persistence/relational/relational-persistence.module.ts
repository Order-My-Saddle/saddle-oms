import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerEntity } from "./entities/customer.entity";
import { CustomerRepository } from "./repositories/customer.repository";
import { CustomerMapper } from "./mappers/customer.mapper";
import { ICustomerRepository } from "../../../domain/customer.repository";

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  providers: [
    CustomerMapper,
    {
      provide: ICustomerRepository,
      useClass: CustomerRepository,
    },
  ],
  exports: [ICustomerRepository, CustomerMapper],
})
export class CustomerRelationalPersistenceModule {}
