import { ExtraId } from "./value-objects/extra-id.value-object";
import { ExtraStatus } from "./value-objects/extra-status.value-object";

export class Extra {
  constructor(
    private readonly _id: ExtraId,
    private _name: string,
    private _description: string,
    private _price: number = 0,
    private _isOptional: boolean = true,
    private _status: ExtraStatus = ExtraStatus.ACTIVE,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {
    this.validateName(_name);
    this.validateDescription(_description);
    this.validatePrice(_price);
  }

  public static create(
    id: ExtraId,
    name: string,
    description: string,
    price: number = 0,
    isOptional: boolean = true,
  ): Extra {
    return new Extra(
      id,
      name,
      description,
      price,
      isOptional,
      ExtraStatus.ACTIVE,
    );
  }

  public updateInfo(
    name: string,
    description: string,
    price: number,
    isOptional?: boolean,
  ): void {
    this.validateName(name);
    this.validateDescription(description);
    this.validatePrice(price);

    this._name = name;
    this._description = description;
    this._price = price;
    if (isOptional !== undefined) {
      this._isOptional = isOptional;
    }
    this._updatedAt = new Date();
  }

  public changeStatus(newStatus: ExtraStatus): void {
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  public activate(): void {
    this.changeStatus(ExtraStatus.ACTIVE);
  }

  public deactivate(): void {
    this.changeStatus(ExtraStatus.INACTIVE);
  }

  public isActive(): boolean {
    return this._status === ExtraStatus.ACTIVE;
  }

  private validateName(name: string): void {
    if (!name?.trim()) throw new Error("Extra name cannot be empty");
    if (name.length > 100)
      throw new Error("Extra name cannot exceed 100 characters");
  }

  private validateDescription(description: string): void {
    if (!description?.trim())
      throw new Error("Extra description cannot be empty");
    if (description.length > 500)
      throw new Error("Extra description cannot exceed 500 characters");
  }

  private validatePrice(price: number): void {
    if (price < 0) throw new Error("Extra price cannot be negative");
  }

  // Getters
  public get id(): ExtraId {
    return this._id;
  }
  public get name(): string {
    return this._name;
  }
  public get description(): string {
    return this._description;
  }
  public get price(): number {
    return this._price;
  }
  public get isOptional(): boolean {
    return this._isOptional;
  }
  public get status(): ExtraStatus {
    return this._status;
  }
  public get createdAt(): Date {
    return this._createdAt;
  }
  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
