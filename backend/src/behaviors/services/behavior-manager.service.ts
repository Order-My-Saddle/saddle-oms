import { Injectable, Logger } from "@nestjs/common";
import {
  BeforeSaveBehavior,
  AfterSaveBehavior,
  BeforeDeleteBehavior,
  AfterDeleteBehavior,
  OnLoadBehavior,
  BehaviorContext,
} from "../interfaces";
import { BlameableBehavior } from "./blameable-behavior.service";
import { TimestampableBehavior } from "./timestampable-behavior.service";
import { SoftDeletableBehavior } from "./soft-deletable-behavior.service";
import { VersionableBehavior } from "./versionable-behavior.service";

@Injectable()
export class BehaviorManager {
  private readonly logger = new Logger(BehaviorManager.name);

  private readonly beforeSaveBehaviors: BeforeSaveBehavior[] = [];
  private readonly afterSaveBehaviors: AfterSaveBehavior[] = [];
  private readonly beforeDeleteBehaviors: BeforeDeleteBehavior[] = [];
  private readonly afterDeleteBehaviors: AfterDeleteBehavior[] = [];
  private readonly onLoadBehaviors: OnLoadBehavior[] = [];

  constructor(
    private readonly blameableBehavior: BlameableBehavior,
    private readonly timestampableBehavior: TimestampableBehavior,
    private readonly softDeletableBehavior: SoftDeletableBehavior,
    private readonly versionableBehavior: VersionableBehavior,
  ) {
    this.registerDefaultBehaviors();
  }

  /**
   * Register all default behaviors
   */
  private registerDefaultBehaviors(): void {
    // Register behaviors that should run before save
    this.registerBeforeSaveBehavior(this.timestampableBehavior);
    this.registerBeforeSaveBehavior(this.blameableBehavior);
    this.registerBeforeSaveBehavior(this.versionableBehavior);

    // Register behaviors that should run after save
    this.registerAfterSaveBehavior(this.timestampableBehavior);

    // Register behaviors that should run before delete
    this.registerBeforeDeleteBehavior(this.softDeletableBehavior);
    this.registerBeforeDeleteBehavior(this.timestampableBehavior);
    this.registerBeforeDeleteBehavior(this.blameableBehavior);

    // Register behaviors that should run after delete
    this.registerAfterDeleteBehavior(this.softDeletableBehavior);

    // Register behaviors that should run on load
    this.registerOnLoadBehavior(this.timestampableBehavior);

    this.logger.log("Default behaviors registered successfully");
  }

  /**
   * Register a before save behavior
   */
  registerBeforeSaveBehavior(behavior: BeforeSaveBehavior): void {
    this.beforeSaveBehaviors.push(behavior);
    this.sortBehaviors(this.beforeSaveBehaviors);
  }

  /**
   * Register an after save behavior
   */
  registerAfterSaveBehavior(behavior: AfterSaveBehavior): void {
    this.afterSaveBehaviors.push(behavior);
    this.sortBehaviors(this.afterSaveBehaviors);
  }

  /**
   * Register a before delete behavior
   */
  registerBeforeDeleteBehavior(behavior: BeforeDeleteBehavior): void {
    this.beforeDeleteBehaviors.push(behavior);
    this.sortBehaviors(this.beforeDeleteBehaviors);
  }

  /**
   * Register an after delete behavior
   */
  registerAfterDeleteBehavior(behavior: AfterDeleteBehavior): void {
    this.afterDeleteBehaviors.push(behavior);
    this.sortBehaviors(this.afterDeleteBehaviors);
  }

  /**
   * Register an on load behavior
   */
  registerOnLoadBehavior(behavior: OnLoadBehavior): void {
    this.onLoadBehaviors.push(behavior);
    this.sortBehaviors(this.onLoadBehaviors);
  }

  /**
   * Apply all before save behaviors to an entity
   */
  async applyBeforeSaveBehaviors(
    entity: any,
    context: BehaviorContext,
  ): Promise<void> {
    const applicableBehaviors = this.beforeSaveBehaviors.filter((behavior) =>
      this.shouldApplyBehavior(behavior, entity, context),
    );

    for (const behavior of applicableBehaviors) {
      try {
        await behavior.beforeSave(entity, context);
        this.logger.debug(
          `Applied ${behavior.name} beforeSave to ${context.entityType}`,
        );
      } catch (error) {
        this.logger.error(`Failed to apply ${behavior.name} beforeSave`, error);
        throw error;
      }
    }
  }

  /**
   * Apply all after save behaviors to an entity
   */
  async applyAfterSaveBehaviors(
    entity: any,
    context: BehaviorContext,
  ): Promise<void> {
    const applicableBehaviors = this.afterSaveBehaviors.filter((behavior) =>
      this.shouldApplyBehavior(behavior, entity, context),
    );

    for (const behavior of applicableBehaviors) {
      try {
        await behavior.afterSave(entity, context);
        this.logger.debug(
          `Applied ${behavior.name} afterSave to ${context.entityType}`,
        );
      } catch (error) {
        this.logger.error(`Failed to apply ${behavior.name} afterSave`, error);
        // After save behaviors should not break the transaction
        this.logger.warn(`Continuing despite ${behavior.name} failure`);
      }
    }
  }

  /**
   * Apply all before delete behaviors to an entity
   */
  async applyBeforeDeleteBehaviors(
    entity: any,
    context: BehaviorContext,
  ): Promise<void> {
    const applicableBehaviors = this.beforeDeleteBehaviors.filter((behavior) =>
      this.shouldApplyBehavior(behavior, entity, context),
    );

    for (const behavior of applicableBehaviors) {
      try {
        await behavior.beforeDelete(entity, context);
        this.logger.debug(
          `Applied ${behavior.name} beforeDelete to ${context.entityType}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to apply ${behavior.name} beforeDelete`,
          error,
        );
        throw error;
      }
    }
  }

  /**
   * Apply all after delete behaviors to an entity
   */
  async applyAfterDeleteBehaviors(
    entity: any,
    context: BehaviorContext,
  ): Promise<void> {
    const applicableBehaviors = this.afterDeleteBehaviors.filter((behavior) =>
      this.shouldApplyBehavior(behavior, entity, context),
    );

    for (const behavior of applicableBehaviors) {
      try {
        await behavior.afterDelete(entity, context);
        this.logger.debug(
          `Applied ${behavior.name} afterDelete to ${context.entityType}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to apply ${behavior.name} afterDelete`,
          error,
        );
        // After delete behaviors should not break the transaction
        this.logger.warn(`Continuing despite ${behavior.name} failure`);
      }
    }
  }

  /**
   * Apply all on load behaviors to an entity
   */
  async applyOnLoadBehaviors(
    entity: any,
    context: BehaviorContext,
  ): Promise<void> {
    const applicableBehaviors = this.onLoadBehaviors.filter((behavior) =>
      this.shouldApplyBehavior(behavior, entity, context),
    );

    for (const behavior of applicableBehaviors) {
      try {
        await behavior.onLoad(entity, context);
        this.logger.debug(
          `Applied ${behavior.name} onLoad to ${context.entityType}`,
        );
      } catch (error) {
        this.logger.error(`Failed to apply ${behavior.name} onLoad`, error);
        // On load behaviors should not break the operation
        this.logger.warn(`Continuing despite ${behavior.name} failure`);
      }
    }
  }

  /**
   * Check if a behavior should be applied to an entity
   */
  private shouldApplyBehavior(
    behavior: any,
    entity: any,
    context: BehaviorContext,
  ): boolean {
    // Check if behavior is configured for auto-apply
    if (behavior.autoApply === false) {
      return false;
    }

    // Check if entity has the appropriate decorator
    const entityClass = entity.constructor;

    // Each behavior should implement its own applicability check
    if (typeof behavior.isApplicable === "function") {
      return behavior.isApplicable(entityClass, entity, context);
    }

    return true;
  }

  /**
   * Sort behaviors by priority (lower number = higher priority)
   */
  private sortBehaviors(behaviors: any[]): void {
    behaviors.sort((a, b) => {
      const priorityA = a.priority ?? 100;
      const priorityB = b.priority ?? 100;
      return priorityA - priorityB;
    });
  }

  /**
   * Get behavior statistics
   */
  getBehaviorStats(): {
    beforeSave: number;
    afterSave: number;
    beforeDelete: number;
    afterDelete: number;
    onLoad: number;
  } {
    return {
      beforeSave: this.beforeSaveBehaviors.length,
      afterSave: this.afterSaveBehaviors.length,
      beforeDelete: this.beforeDeleteBehaviors.length,
      afterDelete: this.afterDeleteBehaviors.length,
      onLoad: this.onLoadBehaviors.length,
    };
  }
}
