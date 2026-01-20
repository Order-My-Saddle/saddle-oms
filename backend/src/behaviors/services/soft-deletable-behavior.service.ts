import { Injectable, Logger } from "@nestjs/common";
import {
  BeforeDeleteBehavior,
  AfterDeleteBehavior,
  BehaviorContext,
} from "../interfaces";
import { getSoftDeletableConfig, isSoftDeletable } from "../decorators";

@Injectable()
export class SoftDeletableBehavior
  implements BeforeDeleteBehavior, AfterDeleteBehavior
{
  private readonly logger = new Logger(SoftDeletableBehavior.name);

  readonly name = "SoftDeletableBehavior";
  readonly priority = 30;
  readonly autoApply = true;

  async beforeDelete(entity: any, context: BehaviorContext): Promise<void> {
    await Promise.resolve();
    if (!this.isApplicable(entity.constructor, entity, context)) {
      return;
    }

    const config = getSoftDeletableConfig(entity.constructor);
    if (!config) return;

    const now = config.dateProvider?.() ?? new Date();

    // Set deletion timestamp
    const deletedAtField = config.deletedAtField!;
    entity[deletedAtField] = now;

    // Set who deleted it
    if (config.trackDeletedBy && context.userId) {
      const deletedByField = config.deletedByField!;
      entity[deletedByField] = context.userId;
    }

    // Set computed isDeleted flag
    if (config.isDeletedField) {
      entity[config.isDeletedField] = true;
    }

    this.logger.debug(`Soft deleted ${context.entityType} entity`);

    // Prevent actual deletion by modifying the context
    // This is a signal to the entity operation service to perform an update instead
    context.metadata = {
      ...context.metadata,
      timestamp: context.metadata?.timestamp ?? new Date(),
      softDelete: true,
      originalOperation: "delete",
    };
  }

  async afterDelete(entity: any, context: BehaviorContext): Promise<void> {
    await Promise.resolve();
    if (!this.isApplicable(entity.constructor, entity, context)) {
      return;
    }

    const config = getSoftDeletableConfig(entity.constructor);
    if (!config?.keepHistory) return;

    this.updateDeletionHistory(entity, config, context);
  }

  isApplicable(
    entityClass: any,
    entity: any,
    context: BehaviorContext,
  ): boolean {
    void entity;
    void context;
    return isSoftDeletable(entityClass);
  }

  private updateDeletionHistory(
    entity: any,
    config: any,
    context: BehaviorContext,
  ): void {
    const historyField = config.historyField!;

    if (!entity[historyField]) {
      entity[historyField] = [];
    }

    entity[historyField].push({
      action: "delete",
      timestamp: new Date(),
      userId: context.userId,
      reason: entity[config.deleteReasonField!] || null,
    });
  }

  /**
   * Restore a soft deleted entity
   */
  async restore(entity: any, userId?: string): Promise<void> {
    await Promise.resolve();
    const entityClass = entity.constructor;
    if (!isSoftDeletable(entityClass)) {
      throw new Error("Entity does not support soft delete");
    }

    const config = getSoftDeletableConfig(entityClass);
    if (!config) return;

    // Clear deletion fields
    entity[config.deletedAtField!] = null;
    if (config.deletedByField) {
      entity[config.deletedByField] = null;
    }
    if (config.isDeletedField) {
      entity[config.isDeletedField] = false;
    }

    // Add restoration to history
    if (config.keepHistory && config.historyField) {
      if (!entity[config.historyField]) {
        entity[config.historyField] = [];
      }

      entity[config.historyField].push({
        action: "restore",
        timestamp: new Date(),
        userId,
      });
    }

    this.logger.debug(`Restored soft deleted entity`);
  }
}
