import { WarehouseId } from "./value-objects/warehouse-id.value-object";

/**
 * Warehouse Domain Entity
 *
 * Represents a warehouse in the order management system.
 * Warehouses manage inventory storage and distribution.
 */
export class Warehouse {
  private _domainEvents: any[] = [];

  constructor(
    private readonly _id: WarehouseId,
    private _name: string,
    private _code: string | null,
    private _address: string | null,
    private _city: string | null,
    private _country: string | null,
    private _isActive: boolean = true,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {
    // Initialize domain entity
  }

  /**
   * Factory method to create a new warehouse
   */
  public static create(
    id: WarehouseId,
    name: string,
    code?: string,
    address?: string,
    city?: string,
    country?: string,
  ): Warehouse {
    const warehouse = new Warehouse(
      id,
      name,
      code || null,
      address || null,
      city || null,
      country || null,
      true,
    );

    // TODO: Domain event for warehouse created
    return warehouse;
  }

  /**
   * Update warehouse information
   */
  public updateInfo(
    name: string,
    code: string | null,
    address: string | null,
    city: string | null,
    country: string | null,
  ): void {
    this._name = name;
    this._code = code;
    this._address = address;
    this._city = city;
    this._country = country;
    this._updatedAt = new Date();
  }

  /**
   * Update warehouse code
   */
  public updateCode(code: string | null): void {
    this._code = code;
    this._updatedAt = new Date();
  }

  /**
   * Update warehouse location
   */
  public updateLocation(
    address: string | null,
    city: string | null,
    country: string | null,
  ): void {
    this._address = address;
    this._city = city;
    this._country = country;
    this._updatedAt = new Date();
  }

  /**
   * Activate warehouse
   */
  public activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Deactivate warehouse
   */
  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * Validate warehouse for operations
   */
  public validateForOperations(): void {
    if (!this.isActive) {
      throw new Error("Cannot perform operations with inactive warehouse");
    }

    if (!this._name) {
      throw new Error("Warehouse must have a valid name");
    }
  }

  /**
   * Get warehouse display info
   */
  public getDisplayInfo(): string {
    const parts = [this._name];
    if (this._code) parts.push(`(${this._code})`);
    if (this._city) parts.push(`- ${this._city}`);
    if (this._country) parts.push(this._country);
    return parts.join(" ");
  }

  /**
   * Get full address
   */
  public getFullAddress(): string {
    const parts = [this._address, this._city, this._country].filter(
      (part) => part && part.trim() !== "",
    );
    return parts.join(", ");
  }

  // Getters
  public get id(): WarehouseId {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get code(): string | null {
    return this._code;
  }

  public get address(): string | null {
    return this._address;
  }

  public get city(): string | null {
    return this._city;
  }

  public get country(): string | null {
    return this._country;
  }

  public get isActive(): boolean {
    return this._isActive;
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
