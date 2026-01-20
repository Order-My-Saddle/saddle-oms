import { CustomerId } from "./value-objects/customer-id.value-object";
import { Email } from "./value-objects/email.value-object";
import { CustomerStatus } from "./value-objects/customer-status.value-object";

/**
 * Customer Domain Entity
 *
 * Represents a customer in the saddle manufacturing system.
 * Based on PostgreSQL schema with address and contact information.
 */
export class Customer {
  private _domainEvents: any[] = [];

  constructor(
    private readonly _id: CustomerId,
    private _email: Email | null,
    private _name: string,
    private _horseName: string | null,
    private _company: string | null,
    private _address: string | null,
    private _city: string | null,
    private _state: string | null,
    private _zipcode: string | null,
    private _country: string | null,
    private _phoneNo: string | null,
    private _cellNo: string | null,
    private _bankAccountNumber: string | null,
    private _fitterId: number | null,
    private _deleted: number = 0,
    private _status: CustomerStatus = CustomerStatus.ACTIVE,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {
    // Initialize domain entity
  }

  /**
   * Factory method to create a new customer
   */
  public static create(
    id: CustomerId,
    name: string,
    email?: string,
    horseName?: string,
    company?: string,
    address?: string,
    city?: string,
    state?: string,
    zipcode?: string,
    country?: string,
    phoneNo?: string,
    cellNo?: string,
    bankAccountNumber?: string,
    fitterId?: number,
  ): Customer {
    const emailObj = email ? Email.create(email) : null;

    const customer = new Customer(
      id,
      emailObj,
      name,
      horseName ?? null,
      company ?? null,
      address ?? null,
      city ?? null,
      state ?? null,
      zipcode ?? null,
      country ?? null,
      phoneNo ?? null,
      cellNo ?? null,
      bankAccountNumber ?? null,
      fitterId ?? null,
      0,
      CustomerStatus.ACTIVE,
    );

    return customer;
  }

  /**
   * Assign a fitter to this customer
   */
  public assignFitter(fitterId: number): void {
    if (this._fitterId === fitterId) {
      return; // Already assigned to this fitter
    }

    this._fitterId = fitterId;
    this._updatedAt = new Date();
  }

  /**
   * Remove fitter assignment
   */
  public removeFitter(): void {
    this._fitterId = null;
    this._updatedAt = new Date();
  }

  /**
   * Change customer status
   */
  public changeStatus(newStatus: CustomerStatus): void {
    if (this._status === newStatus) {
      return; // No change needed
    }

    this._status = newStatus;
    this._updatedAt = new Date();
  }

  /**
   * Mark as deleted (soft delete)
   */
  public markDeleted(): void {
    this._deleted = 1;
    this._updatedAt = new Date();
  }

  /**
   * Restore from deleted state
   */
  public restore(): void {
    this._deleted = 0;
    this._updatedAt = new Date();
  }

  /**
   * Deactivate customer
   */
  public deactivate(): void {
    this.changeStatus(CustomerStatus.INACTIVE);
  }

  /**
   * Reactivate customer
   */
  public reactivate(): void {
    this.changeStatus(CustomerStatus.ACTIVE);
  }

  /**
   * Update customer contact information
   */
  public updateContactInfo(
    name?: string,
    email?: string,
    horseName?: string,
    company?: string,
    address?: string,
    city?: string,
    state?: string,
    zipcode?: string,
    country?: string,
    phoneNo?: string,
    cellNo?: string,
    bankAccountNumber?: string,
  ): void {
    if (name !== undefined) this._name = name;
    if (email !== undefined) this._email = email ? Email.create(email) : null;
    if (horseName !== undefined) this._horseName = horseName ?? null;
    if (company !== undefined) this._company = company ?? null;
    if (address !== undefined) this._address = address ?? null;
    if (city !== undefined) this._city = city ?? null;
    if (state !== undefined) this._state = state ?? null;
    if (zipcode !== undefined) this._zipcode = zipcode ?? null;
    if (country !== undefined) this._country = country ?? null;
    if (phoneNo !== undefined) this._phoneNo = phoneNo ?? null;
    if (cellNo !== undefined) this._cellNo = cellNo ?? null;
    if (bankAccountNumber !== undefined)
      this._bankAccountNumber = bankAccountNumber ?? null;
    this._updatedAt = new Date();
  }

  /**
   * Check if customer is active (not deleted)
   */
  public isActive(): boolean {
    return this._deleted === 0;
  }

  /**
   * Check if customer has a fitter assigned
   */
  public hasFitter(): boolean {
    return this._fitterId !== null;
  }

  /**
   * Validate customer for order creation
   */
  public validateForOrder(): void {
    if (!this.isActive()) {
      throw new Error("Cannot create order for inactive customer");
    }

    if (!this._name) {
      throw new Error("Customer must have valid name");
    }
  }

  /**
   * Get customer display name for UI
   */
  public getDisplayName(): string {
    if (this._email) {
      return `${this._name} (${this._email.value})`;
    }
    return this._name;
  }

  /**
   * Get display info
   */
  public getDisplayInfo(): string {
    const parts = [this._city, this._state, this._country].filter(Boolean);
    return parts.join(", ") || "No location";
  }

  // Getters
  public get id(): CustomerId {
    return this._id;
  }

  public get email(): Email | null {
    return this._email;
  }

  public get name(): string {
    return this._name;
  }

  public get horseName(): string | null {
    return this._horseName;
  }

  public get company(): string | null {
    return this._company;
  }

  public get address(): string | null {
    return this._address;
  }

  public get city(): string | null {
    return this._city;
  }

  public get state(): string | null {
    return this._state;
  }

  public get zipcode(): string | null {
    return this._zipcode;
  }

  public get country(): string | null {
    return this._country;
  }

  public get phoneNo(): string | null {
    return this._phoneNo;
  }

  public get cellNo(): string | null {
    return this._cellNo;
  }

  public get bankAccountNumber(): string | null {
    return this._bankAccountNumber;
  }

  public get fitterId(): number | null {
    return this._fitterId;
  }

  public get deleted(): number {
    return this._deleted;
  }

  public get status(): CustomerStatus {
    return this._status;
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
    return this._domainEvents.slice();
  }

  /**
   * Mark all domain events as committed
   */
  public markEventsAsCommitted(): void {
    this._domainEvents = [];
  }
}
