import { SetMetadata } from "@nestjs/common";

/**
 * Decorator to mark an entity as soft deletable
 * Migration from PHP SoftDeletableTrait
 */
export const SOFT_DELETABLE_METADATA = "soft_deletable:config";

export interface SoftDeletableOptions {
  /**
   * Field name for storing deletion timestamp
   * @default 'deletedAt'
   */
  deletedAtField?: string;

  /**
   * Field name for storing who deleted the entity
   * @default 'deletedBy'
   */
  deletedByField?: string;

  /**
   * Field name for storing deletion reason
   * @default 'deleteReason'
   */
  deleteReasonField?: string;

  /**
   * Field name for computed isDeleted flag
   * @default 'isDeleted'
   */
  isDeletedField?: string;

  /**
   * Whether to track who deleted the entity
   * @default true
   */
  trackDeletedBy?: boolean;

  /**
   * Whether to allow deletion reasons
   * @default false
   */
  allowDeleteReason?: boolean;

  /**
   * Whether to maintain a history of deletions/restorations
   * @default false
   */
  keepHistory?: boolean;

  /**
   * Field name for storing deletion history
   * @default 'deletionHistory'
   */
  historyField?: string;

  /**
   * Whether deleted entities can be restored
   * @default true
   */
  allowRestore?: boolean;

  /**
   * Custom date provider function for deletion timestamp
   */
  dateProvider?: () => Date;
}

/**
 * SoftDeletable decorator
 *
 * @example
 * ```typescript
 * @Entity()
 * @SoftDeletable()
 * export class User {
 *   @PrimaryGeneratedColumn()
 *   id: number;
 *
 *   @Column()
 *   name: string;
 *
 *   // This field will be automatically managed
 *   @DeleteDateColumn()
 *   deletedAt?: Date;
 * }
 * ```
 *
 * @example With custom options
 * ```typescript
 * @Entity()
 * @SoftDeletable({
 *   deletedAtField: 'dateDeleted',
 *   trackDeletedBy: true,
 *   allowDeleteReason: true
 * })
 * export class Document {
 *   @Column({ nullable: true })
 *   dateDeleted?: Date;
 *
 *   @Column({ nullable: true })
 *   deletedBy?: string;
 *
 *   @Column({ nullable: true })
 *   deleteReason?: string;
 * }
 * ```
 */
export function SoftDeletable(
  options: SoftDeletableOptions = {},
): ClassDecorator {
  const config: SoftDeletableOptions = {
    deletedAtField: "deletedAt",
    deletedByField: "deletedBy",
    deleteReasonField: "deleteReason",
    isDeletedField: "isDeleted",
    trackDeletedBy: true,
    allowDeleteReason: false,
    keepHistory: false,
    historyField: "deletionHistory",
    allowRestore: true,
    dateProvider: () => new Date(),
    ...options,
  };

  return SetMetadata(SOFT_DELETABLE_METADATA, config);
}

/**
 * Get soft deletable configuration from entity class
 */
export function getSoftDeletableConfig(
  target: any,
): SoftDeletableOptions | undefined {
  return Reflect.getMetadata(SOFT_DELETABLE_METADATA, target);
}

/**
 * Check if entity has soft deletable behavior
 */
export function isSoftDeletable(target: any): boolean {
  return Reflect.hasMetadata(SOFT_DELETABLE_METADATA, target);
}
