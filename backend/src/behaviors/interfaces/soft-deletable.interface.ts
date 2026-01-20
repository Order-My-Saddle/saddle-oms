/**
 * Interface for entities that support soft deletion
 * Equivalent to PHP SoftDeletableTrait
 */
export interface SoftDeletable {
  /**
   * When this entity was deleted (null if not deleted)
   */
  deletedAt?: Date | null;

  /**
   * Whether this entity is deleted
   */
  isDeleted?: boolean;
}

/**
 * Extended interface for entities with advanced soft delete features
 */
export interface ExtendedSoftDeletable extends SoftDeletable {
  /**
   * Who deleted this entity
   */
  deletedBy?: string;

  /**
   * Reason for deletion
   */
  deleteReason?: string;

  /**
   * Whether this entity can be restored
   */
  canRestore?: boolean;

  /**
   * History of deletions and restorations
   */
  deletionHistory?: Array<{
    action: "delete" | "restore";
    timestamp: Date;
    userId?: string;
    reason?: string;
  }>;
}
