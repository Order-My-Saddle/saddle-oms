import { IEvent } from "@nestjs/cqrs";
import { CustomerStatus } from "../value-objects/customer-status.value-object";

export class CustomerStatusChangedEvent implements IEvent {
  constructor(
    public readonly customerId: string,
    public readonly newStatus: CustomerStatus,
    public readonly previousStatus: CustomerStatus,
    public readonly changedAt: Date = new Date(),
  ) {}
}
