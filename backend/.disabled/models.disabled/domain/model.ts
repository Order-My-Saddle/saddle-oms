/**
 * Model Domain Entity - Simplified for production matching
 *
 * Represents a saddle model in the OMS system.
 * Models belong to specific brands and can have various configurations.
 */
export class Model {
  constructor(
    private readonly _id: number,
    private readonly _brandId: number,
    private _name: string,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
    private _deletedAt: Date | null = null,
  ) {
    this.validateName(_name);
  }

  /**
   * Factory method to create a new model
   */
  public static create(brandId: number, name: string): Model {
    return new Model(0, brandId, name); // ID will be set by database
  }

  /**
   * Update model information
   */
  public updateName(name: string): void {
    this.validateName(name);
    this._name = name;
    this._updatedAt = new Date();
  }

  /**
   * Soft delete model
   */
  public delete(): void {
    this._deletedAt = new Date();
  }

  /**
   * Check if model is active (not soft deleted)
   */
  public isActive(): boolean {
    return this._deletedAt === null;
  }

  /**
   * Validate model name
   */
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Model name cannot be empty");
    }

    if (name.length > 255) {
      throw new Error("Model name cannot exceed 255 characters");
    }
  }

  /**
   * Get full model name with brand
   */
  public getFullName(brandName: string): string {
    return `${brandName} ${this._name}`;
  }

  // Getters
  public get id(): number {
    return this._id;
  }

  public get brandId(): number {
    return this._brandId;
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
