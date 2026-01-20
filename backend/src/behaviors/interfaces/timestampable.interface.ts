/**
 * Interface for entities that track creation and modification timestamps
 * Equivalent to PHP TimestampableTrait
 */
export interface Timestampable {
  /**
   * When this entity was created
   */
  createdAt?: Date;

  /**
   * When this entity was last updated
   */
  updatedAt?: Date;
}

/**
 * Extended interface for entities that need detailed timestamp tracking
 */
export interface ExtendedTimestampable extends Timestampable {
  /**
   * When this entity was deleted (for soft delete)
   */
  deletedAt?: Date;

  /**
   * When this entity was last accessed/viewed
   */
  lastAccessedAt?: Date;

  /**
   * History of modifications with timestamps
   */
  modificationHistory?: Array<{
    timestamp: Date;
    action: "create" | "update" | "delete" | "access";
    userId?: string;
    changes?: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
  }>;
}
