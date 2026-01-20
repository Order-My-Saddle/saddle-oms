import { SetMetadata } from "@nestjs/common";

/**
 * Decorator to mark an entity as blameable (tracks who created/updated it)
 * Migration from PHP BlameableTrait
 */
export const BLAMEABLE_METADATA = "blameable:config";

export interface BlameableOptions {
  /**
   * Field name for storing who created the entity
   * @default 'createdBy'
   */
  createdByField?: string;

  /**
   * Field name for storing who updated the entity
   * @default 'updatedBy'
   */
  updatedByField?: string;

  /**
   * Field name for storing who deleted the entity
   * @default 'deletedBy'
   */
  deletedByField?: string;

  /**
   * Whether to track creation user
   * @default true
   */
  trackCreation?: boolean;

  /**
   * Whether to track updates
   * @default true
   */
  trackUpdates?: boolean;

  /**
   * Whether to track deletions
   * @default false
   */
  trackDeletions?: boolean;

  /**
   * Whether to maintain a history of modifications
   * @default false
   */
  keepHistory?: boolean;

  /**
   * Field name for storing modification history
   * @default 'modifiedByHistory'
   */
  historyField?: string;

  /**
   * Whether to track user relationships (delegation, proxy actions)
   * @default false
   */
  trackRelationships?: boolean;

  /**
   * Field name for storing user relationship history
   * @default 'userRelationships'
   */
  relationshipField?: string;

  /**
   * Maximum number of history entries to keep
   * @default 100
   */
  maxHistorySize?: number;
}

/**
 * Blameable decorator
 *
 * @example
 * ```typescript
 * @Entity()
 * @Blameable()
 * export class User {
 *   @PrimaryGeneratedColumn()
 *   id: number;
 *
 *   @Column()
 *   name: string;
 *
 *   // These fields will be automatically populated
 *   @Column({ nullable: true })
 *   createdBy?: string;
 *
 *   @Column({ nullable: true })
 *   updatedBy?: string;
 * }
 * ```
 */
export function Blameable(options: BlameableOptions = {}): ClassDecorator {
  const config: BlameableOptions = {
    createdByField: "createdBy",
    updatedByField: "updatedBy",
    deletedByField: "deletedBy",
    trackCreation: true,
    trackUpdates: true,
    trackDeletions: false,
    keepHistory: false,
    historyField: "modifiedByHistory",
    ...options,
  };

  return SetMetadata(BLAMEABLE_METADATA, config);
}

/**
 * Get blameable configuration from entity class
 */
export function getBlameableConfig(target: any): BlameableOptions | undefined {
  return Reflect.getMetadata(BLAMEABLE_METADATA, target);
}

/**
 * Check if entity has blameable behavior
 */
export function isBlameable(target: any): boolean {
  return Reflect.hasMetadata(BLAMEABLE_METADATA, target);
}
