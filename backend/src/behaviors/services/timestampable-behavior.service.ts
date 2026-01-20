import { Injectable, Logger } from "@nestjs/common";
import {
  BeforeSaveBehavior,
  AfterSaveBehavior,
  BeforeDeleteBehavior,
  OnLoadBehavior,
  BehaviorContext,
} from "../interfaces";
import {
  getTimestampableConfig,
  isTimestampable,
  TimestampableOptions,
} from "../decorators";

@Injectable()
export class TimestampableBehavior
  implements
    BeforeSaveBehavior,
    AfterSaveBehavior,
    BeforeDeleteBehavior,
    OnLoadBehavior
{
  private readonly logger = new Logger(TimestampableBehavior.name);

  readonly name = "TimestampableBehavior";
  readonly priority = 10; // High priority
  readonly autoApply = true;

  /**
   * Apply timestamps before save
   */
  async beforeSave(entity: any, context: BehaviorContext): Promise<void> {
    await Promise.resolve();
    if (!this.isApplicable(entity.constructor, entity, context)) {
      return;
    }

    const config = getTimestampableConfig(entity.constructor);
    if (!config) return;

    const now = config.dateProvider?.() ?? new Date();

    // Set creation timestamp for new entities
    if (context.operation === "create" && config.trackCreation) {
      const createdAtField = config.createdAtField!;
      if (!entity[createdAtField]) {
        entity[createdAtField] = now;
        this.logger.debug(
          `Set ${createdAtField} for new ${context.entityType}`,
        );
      }
    }

    // Update timestamp for create and update operations
    if (
      ["create", "update"].includes(context.operation) &&
      config.trackUpdates
    ) {
      const updatedAtField = config.updatedAtField!;
      entity[updatedAtField] = now;
      this.logger.debug(`Updated ${updatedAtField} for ${context.entityType}`);
    }

    // Set deletion timestamp for delete operations (used with soft delete)
    if (context.operation === "delete" && config.trackDeletions) {
      const deletedAtField = config.deletedAtField!;
      entity[deletedAtField] = now;
      this.logger.debug(
        `Set ${deletedAtField} for deleted ${context.entityType}`,
      );
    }

    // Maintain modification history if enabled
    if (config.keepHistory && config.historyField) {
      this.updateModificationHistory(entity, config, context, now);
    }
  }

  /**
   * Update access timestamp after save (if tracking access)
   */
  async afterSave(entity: any, context: BehaviorContext): Promise<void> {
    await Promise.resolve();
    if (!this.isApplicable(entity.constructor, entity, context)) {
      return;
    }

    const config = getTimestampableConfig(entity.constructor);
    if (!config?.trackAccess) return;

    const lastAccessedAtField = config.lastAccessedAtField!;
    if (lastAccessedAtField in entity) {
      entity[lastAccessedAtField] = config.dateProvider?.() ?? new Date();
    }
  }

  /**
   * Set deletion timestamp before delete
   */
  async beforeDelete(entity: any, context: BehaviorContext): Promise<void> {
    await Promise.resolve();
    if (!this.isApplicable(entity.constructor, entity, context)) {
      return;
    }

    const config = getTimestampableConfig(entity.constructor);
    if (!config?.trackDeletions) return;

    const deletedAtField = config.deletedAtField!;
    const now = config.dateProvider?.() ?? new Date();

    entity[deletedAtField] = now;
    this.logger.debug(
      `Set ${deletedAtField} for deleted ${context.entityType}`,
    );

    // Maintain modification history if enabled
    if (config.keepHistory && config.historyField) {
      this.updateModificationHistory(entity, config, context, now);
    }
  }

  /**
   * Update access timestamp on load (if tracking access)
   */
  async onLoad(entity: any, context: BehaviorContext): Promise<void> {
    await Promise.resolve();
    if (!this.isApplicable(entity.constructor, entity, context)) {
      return;
    }

    const config = getTimestampableConfig(entity.constructor);
    if (!config?.trackAccess) return;

    const lastAccessedAtField = config.lastAccessedAtField!;
    if (lastAccessedAtField in entity) {
      entity[lastAccessedAtField] = config.dateProvider?.() ?? new Date();

      // Note: In a real implementation, you might want to asynchronously
      // update this in the database without affecting the current operation
      this.logger.debug(
        `Updated ${lastAccessedAtField} for accessed ${context.entityType}`,
      );
    }
  }

  /**
   * Check if this behavior is applicable to the entity
   */
  isApplicable(
    entityClass: any,
    entity: any,
    context: BehaviorContext,
  ): boolean {
    void entity;
    void context;
    return isTimestampable(entityClass);
  }

  /**
   * Update modification history
   */
  private updateModificationHistory(
    entity: any,
    config: TimestampableOptions,
    context: BehaviorContext,
    timestamp: Date,
  ): void {
    const historyField = config.historyField!;

    if (!entity[historyField]) {
      entity[historyField] = [];
    }

    // Determine what changed
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    if (context.metadata?.originalEntity) {
      const original = context.metadata.originalEntity;

      Object.keys(entity).forEach((key) => {
        if (original[key] !== entity[key]) {
          changes.push({
            field: key,
            oldValue: original[key],
            newValue: entity[key],
          });
        }
      });
    }

    // Add history entry
    const historyEntry = {
      timestamp,
      action: context.operation,
      userId: context.userId,
      changes,
    };

    entity[historyField].push(historyEntry);

    // Limit history size to prevent unbounded growth
    const maxHistorySize = 100;
    if (entity[historyField].length > maxHistorySize) {
      entity[historyField] = entity[historyField].slice(-maxHistorySize);
    }

    this.logger.debug(
      `Added history entry for ${context.entityType}: ${changes.length} changes`,
    );
  }

  /**
   * Get timestamp for an entity field
   */
  getTimestamp(
    entity: any,
    field: "created" | "updated" | "deleted" | "accessed",
  ): Date | null {
    const entityClass = entity.constructor;
    if (!isTimestampable(entityClass)) {
      return null;
    }

    const config = getTimestampableConfig(entityClass);
    if (!config) return null;

    const fieldMap = {
      created: config.createdAtField,
      updated: config.updatedAtField,
      deleted: config.deletedAtField,
      accessed: config.lastAccessedAtField,
    };

    const fieldName = fieldMap[field];
    return fieldName && entity[fieldName] ? entity[fieldName] : null;
  }

  /**
   * Check if entity was modified since a specific date
   */
  isModifiedSince(entity: any, date: Date): boolean {
    const updatedAt = this.getTimestamp(entity, "updated");
    return updatedAt ? updatedAt > date : false;
  }

  /**
   * Get modification history for an entity
   */
  getModificationHistory(entity: any): any[] | null {
    const entityClass = entity.constructor;
    if (!isTimestampable(entityClass)) {
      return null;
    }

    const config = getTimestampableConfig(entityClass);
    if (!config?.keepHistory || !config.historyField) {
      return null;
    }

    return entity[config.historyField] || [];
  }
}
