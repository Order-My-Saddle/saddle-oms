import { SetMetadata } from "@nestjs/common";

/**
 * Decorator to mark an entity as timestampable (automatically manages created/updated timestamps)
 * Migration from PHP TimestampableTrait
 */
export const TIMESTAMPABLE_METADATA = "timestampable:config";

export interface TimestampableOptions {
  /**
   * Field name for storing creation timestamp
   * @default 'createdAt'
   */
  createdAtField?: string;

  /**
   * Field name for storing update timestamp
   * @default 'updatedAt'
   */
  updatedAtField?: string;

  /**
   * Field name for storing deletion timestamp
   * @default 'deletedAt'
   */
  deletedAtField?: string;

  /**
   * Field name for storing last access timestamp
   * @default 'lastAccessedAt'
   */
  lastAccessedAtField?: string;

  /**
   * Whether to automatically set creation timestamp
   * @default true
   */
  trackCreation?: boolean;

  /**
   * Whether to automatically update timestamp on modifications
   * @default true
   */
  trackUpdates?: boolean;

  /**
   * Whether to track deletion timestamp
   * @default false
   */
  trackDeletions?: boolean;

  /**
   * Whether to track access timestamps
   * @default false
   */
  trackAccess?: boolean;

  /**
   * Whether to maintain a history of modifications
   * @default false
   */
  keepHistory?: boolean;

  /**
   * Field name for storing modification history
   * @default 'modificationHistory'
   */
  historyField?: string;

  /**
   * Custom date provider function
   */
  dateProvider?: () => Date;
}

/**
 * Timestampable decorator
 *
 * @example
 * ```typescript
 * @Entity()
 * @Timestampable()
 * export class User {
 *   @PrimaryGeneratedColumn()
 *   id: number;
 *
 *   @Column()
 *   name: string;
 *
 *   // These fields will be automatically populated
 *   @CreateDateColumn()
 *   createdAt: Date;
 *
 *   @UpdateDateColumn()
 *   updatedAt: Date;
 * }
 * ```
 *
 * @example With custom options
 * ```typescript
 * @Entity()
 * @Timestampable({
 *   createdAtField: 'dateCreated',
 *   updatedAtField: 'dateModified',
 *   trackAccess: true
 * })
 * export class Document {
 *   @Column()
 *   dateCreated: Date;
 *
 *   @Column()
 *   dateModified: Date;
 *
 *   @Column({ nullable: true })
 *   lastAccessedAt?: Date;
 * }
 * ```
 */
export function Timestampable(
  options: TimestampableOptions = {},
): ClassDecorator {
  const config: TimestampableOptions = {
    createdAtField: "createdAt",
    updatedAtField: "updatedAt",
    deletedAtField: "deletedAt",
    lastAccessedAtField: "lastAccessedAt",
    trackCreation: true,
    trackUpdates: true,
    trackDeletions: false,
    trackAccess: false,
    keepHistory: false,
    historyField: "modificationHistory",
    dateProvider: () => new Date(),
    ...options,
  };

  return SetMetadata(TIMESTAMPABLE_METADATA, config);
}

/**
 * Get timestampable configuration from entity class
 */
export function getTimestampableConfig(
  target: any,
): TimestampableOptions | undefined {
  return Reflect.getMetadata(TIMESTAMPABLE_METADATA, target);
}

/**
 * Check if entity has timestampable behavior
 */
export function isTimestampable(target: any): boolean {
  return Reflect.hasMetadata(TIMESTAMPABLE_METADATA, target);
}
