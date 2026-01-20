import { IEvent } from "@nestjs/cqrs";

export class CustomerCreatedEvent implements IEvent {
  constructor(
    public readonly customerId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly createdAt: Date = new Date(),
  ) {}
}
