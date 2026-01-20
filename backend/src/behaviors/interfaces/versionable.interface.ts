/**
 * Interface for entities that support versioning for optimistic locking
 * Equivalent to PHP VersionableTrait
 */
export interface Versionable {
  /**
   * Version number for optimistic locking
   */
  version?: number;
}

/**
 * Extended interface for entities with advanced versioning features
 */
export interface ExtendedVersionable extends Versionable {
  /**
   * Hash of entity content for change detection
   */
  contentHash?: string;

  /**
   * Whether this entity has been modified since last save
   */
  isDirty?: boolean;

  /**
   * Checksum for data integrity validation
   */
  checksum?: string;

  /**
   * Version history for audit trail
   */
  versionHistory?: Array<{
    version: number;
    timestamp: Date;
    userId?: string;
    changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
    contentHash: string;
  }>;
}
