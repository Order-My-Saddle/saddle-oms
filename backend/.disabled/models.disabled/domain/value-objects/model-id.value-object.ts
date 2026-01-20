import { v4 as uuidv4, validate as uuidValidate } from "uuid";

/**
 * Model ID Value Object
 * Ensures model IDs are valid UUIDs
 */
export class ModelId {
  constructor(private readonly _value: string) {
    if (!_value) {
      throw new Error("Model ID cannot be empty");
    }

    if (!uuidValidate(_value)) {
      throw new Error("Model ID must be a valid UUID");
    }
  }

  /**
   * Generate a new model ID
   */
  public static generate(): ModelId {
    return new ModelId(uuidv4());
  }

  /**
   * Create from existing string
   */
  public static fromString(value: string): ModelId {
    return new ModelId(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: ModelId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
