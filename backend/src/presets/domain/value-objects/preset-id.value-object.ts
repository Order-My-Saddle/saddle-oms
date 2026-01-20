/**
 * Preset ID Value Object
 *
 * Represents a unique identifier for a preset entity.
 * Uses integer IDs to match production database schema (SERIAL PRIMARY KEY).
 */
export class PresetId {
  private readonly _id: number;

  constructor(id: number) {
    this.validate(id);
    this._id = id;
  }

  /**
   * Create preset ID from number
   */
  public static fromNumber(id: number): PresetId {
    return new PresetId(id);
  }

  /**
   * Create preset ID from string (parses to integer)
   */
  public static fromString(id: string): PresetId {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      throw new Error("Preset ID must be a valid integer");
    }
    return new PresetId(parsed);
  }

  /**
   * Get the numeric value
   */
  public get value(): number {
    return this._id;
  }

  /**
   * Get the numeric value of the ID
   */
  public toNumber(): number {
    return this._id;
  }

  /**
   * Get the string representation of the ID
   */
  public toString(): string {
    return this._id.toString();
  }

  /**
   * Validate the preset ID
   */
  private validate(id: number): void {
    if (id === null || id === undefined) {
      throw new Error("Preset ID cannot be empty");
    }

    if (typeof id !== "number" || !Number.isInteger(id)) {
      throw new Error("Preset ID must be an integer");
    }

    if (id <= 0) {
      throw new Error("Preset ID must be a positive integer");
    }
  }
}
