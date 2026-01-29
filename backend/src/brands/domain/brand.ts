/**
 * Brand Domain Entity - Simplified for production matching
 *
 * Represents a saddle brand in the OMS system.
 * Brands can have multiple models associated with them.
 *
 * Note: The production brands table does not have audit columns
 * (created_at, updated_at, deleted_at), so this domain model
 * is simplified to match.
 */
export class Brand {
  constructor(
    private readonly _id: number,
    private _name: string,
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
  }

  /**
   * Check if brand is active (always true since brands table has no soft-delete)
   */
  public isActive(): boolean {
    return true;
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
}
