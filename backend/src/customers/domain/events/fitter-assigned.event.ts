import { IEvent } from "@nestjs/cqrs";

export class FitterAssignedEvent implements IEvent {
  constructor(
    public readonly customerId: string,
    public readonly newFitterId: string,
    public readonly previousFitterId?: string,
    public readonly assignedAt: Date = new Date(),
  ) {}
}
