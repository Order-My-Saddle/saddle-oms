/**
 * Base interface for all entity behaviors
 */
export interface Behavior {
  /**
   * The name of the behavior
   */
  name: string;

  /**
   * Priority for applying behaviors (lower numbers = higher priority)
   */
  priority?: number;

  /**
   * Whether this behavior should be applied automatically
   */
  autoApply?: boolean;
}

/**
 * Interface for behaviors that need to modify entities before save
 */
export interface BeforeSaveBehavior extends Behavior {
  /**
   * Execute before entity save
   */
  beforeSave(entity: any, context: BehaviorContext): Promise<void> | void;
}

/**
 * Interface for behaviors that need to modify entities after save
 */
export interface AfterSaveBehavior extends Behavior {
  /**
   * Execute after entity save
   */
  afterSave(entity: any, context: BehaviorContext): Promise<void> | void;
}

/**
 * Interface for behaviors that need to modify entities before delete
 */
export interface BeforeDeleteBehavior extends Behavior {
  /**
   * Execute before entity delete
   */
  beforeDelete(entity: any, context: BehaviorContext): Promise<void> | void;
}

/**
 * Interface for behaviors that need to modify entities after delete
 */
export interface AfterDeleteBehavior extends Behavior {
  /**
   * Execute after entity delete
   */
  afterDelete(entity: any, context: BehaviorContext): Promise<void> | void;
}

/**
 * Interface for behaviors that need to modify entities on load
 */
export interface OnLoadBehavior extends Behavior {
  /**
   * Execute when entity is loaded
   */
  onLoad(entity: any, context: BehaviorContext): Promise<void> | void;
}

/**
 * Context passed to behavior methods
 */
export interface BehaviorContext {
  /**
   * The entity type being processed
   */
  entityType: string;

  /**
   * The operation being performed
   */
  operation: "create" | "update" | "delete" | "load";

  /**
   * The user performing the operation
   */
  userId?: string;

  /**
   * Whether this is a new entity being created
   */
  isNewEntity?: boolean;

  /**
   * Additional metadata
   */
  metadata?: {
    timestamp: Date;
    originalEntity?: any;
    [key: string]: any;
  };

  /**
   * Entity manager for database operations
   */
  entityManager?: any;
}
