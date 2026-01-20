import { FactoryEmployeeId } from "./value-objects/factory-employee-id.value-object";

/**
 * Factory Employee Domain Entity - Pure business logic
 *
 * Represents an employee working at a specific factory in the saddle manufacturing system.
 * Factory employees are associated with a factory and have specific roles and responsibilities.
 */
export class FactoryEmployee {
  private _domainEvents: any[] = [];

  constructor(
    private readonly _id: FactoryEmployeeId,
    private _factoryId: number,
    private _name: string,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {
    this.validateEmployee();
  }

  /**
   * Factory method to create a new factory employee
   */
  public static create(
    id: FactoryEmployeeId,
    factoryId: number,
    name: string,
  ): FactoryEmployee {
    const employee = new FactoryEmployee(
      id,
      factoryId,
      name,
      new Date(),
      new Date(),
    );

    // Domain event will be added when CQRS is fully integrated
    // employee._domainEvents.push(new FactoryEmployeeCreatedEvent(id.value, factoryId, name));

    return employee;
  }

  /**
   * Update employee name
   */
  public updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error("Employee name cannot be empty");
    }

    if (newName.trim().length > 255) {
      throw new Error("Employee name cannot exceed 255 characters");
    }

    const oldName = this._name;
    void oldName;
    this._name = newName.trim();
    this._updatedAt = new Date();

    // Domain event will be added when CQRS is fully integrated
    // this._domainEvents.push(new FactoryEmployeeNameUpdatedEvent(this._id.value, newName, oldName));
  }

  /**
   * Transfer employee to another factory
   */
  public transferToFactory(newFactoryId: number): void {
    if (!newFactoryId || newFactoryId <= 0) {
      throw new Error("Factory ID must be a positive number");
    }

    if (this._factoryId === newFactoryId) {
      return; // Already assigned to this factory
    }

    const previousFactoryId = this._factoryId;
    void previousFactoryId;
    this._factoryId = newFactoryId;
    this._updatedAt = new Date();

    // Domain event will be added when CQRS is fully integrated
    // this._domainEvents.push(new FactoryEmployeeTransferredEvent(this._id.value, newFactoryId, previousFactoryId));
  }

  /**
   * Validate employee data
   */
  private validateEmployee(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new Error("Employee name is required");
    }

    if (this._name.trim().length > 255) {
      throw new Error("Employee name cannot exceed 255 characters");
    }

    if (!this._factoryId || this._factoryId <= 0) {
      throw new Error("Factory ID must be a positive number");
    }
  }

  /**
   * Get employee display information
   */
  public getDisplayInfo(): string {
    return `${this._name} (Factory: ${this._factoryId})`;
  }

  /**
   * Check if employee belongs to specific factory
   */
  public belongsToFactory(factoryId: number): boolean {
    return this._factoryId === factoryId;
  }

  // Getters
  public get id(): FactoryEmployeeId {
    return this._id;
  }

  public get factoryId(): number {
    return this._factoryId;
  }

  public get name(): string {
    return this._name;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Get uncommitted domain events (for CQRS integration)
   */
  public getUncommittedEvents(): any[] {
    return this._domainEvents.slice(); // Return copy to prevent mutations
  }

  /**
   * Mark all domain events as committed
   */
  public markEventsAsCommitted(): void {
    this._domainEvents = [];
  }
}
