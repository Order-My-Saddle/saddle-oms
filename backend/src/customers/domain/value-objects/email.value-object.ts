/**
 * Email Value Object
 * Ensures emails are valid and properly formatted
 * Handles legacy data with invalid email formats gracefully
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(
    private readonly _value: string,
    private readonly _isValid: boolean = true,
  ) {}

  /**
   * Create from string value
   * Returns email with validity flag instead of throwing for invalid formats
   */
  public static fromString(value: string | null | undefined): Email {
    if (!value || value.trim() === "") {
      return new Email("", false);
    }

    const trimmedValue = value.toLowerCase().trim();
    const isValid = Email.EMAIL_REGEX.test(trimmedValue);
    return new Email(trimmedValue, isValid);
  }

  /**
   * Alias for fromString - Create from string value
   */
  public static create(value: string | null | undefined): Email {
    return Email.fromString(value);
  }

  /**
   * Create email with strict validation (throws on invalid)
   */
  public static fromStringStrict(value: string): Email {
    if (!value || value.trim() === "") {
      throw new Error("Email cannot be empty");
    }

    const trimmedValue = value.toLowerCase().trim();
    if (!Email.EMAIL_REGEX.test(trimmedValue)) {
      throw new Error("Invalid email format");
    }

    return new Email(trimmedValue, true);
  }

  public get value(): string {
    return this._value;
  }

  public get isValid(): boolean {
    return this._isValid;
  }

  public get domain(): string {
    if (!this._isValid) {
      return "";
    }
    return this._value.split("@")[1] || "";
  }

  public equals(other: Email): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
