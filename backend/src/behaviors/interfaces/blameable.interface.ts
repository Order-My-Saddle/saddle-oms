/**
 * Interface for entities that track who created and modified them
 * Equivalent to PHP BlameableTrait
 */
export interface Blameable {
  /**
   * The user who created this entity
   */
  createdBy?: string;

  /**
   * The user who last updated this entity
   */
  updatedBy?: string;
}

/**
 * Extended interface for entities that need detailed user tracking
 */
export interface ExtendedBlameable extends Blameable {
  /**
   * The user who deleted this entity (for soft delete)
   */
  deletedBy?: string;

  /**
   * History of users who have modified this entity
   */
  modifiedByHistory?: Array<{
    userId: string;
    action: "create" | "update" | "delete";
    timestamp: Date;
  }>;
}
