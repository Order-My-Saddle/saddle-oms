/**
 * Brand Domain Entity - Simplified for production matching
 *
 * Represents a saddle brand in the OMS system.
 * Brands can have multiple models associated with them.
 */
export class Brand {
  constructor(
    private readonly _id: number,
    private _name: string,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
    private _deletedAt: Date | null = null,
  ) {
    this.validateName(_name);
  }

  /**
   * Factory method to create a new brand
   */
  public static create(name: string): Brand {
    return new Brand(0, name); // ID will be set by database
  }

  /**
   * Update brand information
   */
  public updateName(name: string): void {
    this.validateName(name);
    this._name = name;
    this._updatedAt = new Date();
  }

  /**
   * Soft delete brand
   */
  public delete(): void {
    this._deletedAt = new Date();
  }

  /**
   * Check if brand is active (not soft deleted)
   */
  public isActive(): boolean {
    return this._deletedAt === null;
  }

  /**
   * Validate brand name
   */
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Brand name cannot be empty");
    }

    if (name.length > 200) {
      throw new Error("Brand name cannot exceed 200 characters");
    }
  }

  // Getters
  public get id(): number {
    return this._id;
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

  public get deletedAt(): Date | null {
    return this._deletedAt;
  }
}
