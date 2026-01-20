import { Injectable, Logger } from "@nestjs/common";
import {
  BeforeSaveBehavior,
  BeforeDeleteBehavior,
  BehaviorContext,
} from "../interfaces";
import { getBlameableConfig, isBlameable } from "../decorators";

@Injectable()
export class BlameableBehavior
  implements BeforeSaveBehavior, BeforeDeleteBehavior
{
  private readonly logger = new Logger(BlameableBehavior.name);

  readonly name = "BlameableBehavior";
  readonly priority = 20;
  readonly autoApply = true;

  async beforeSave(entity: any, context: BehaviorContext): Promise<void> {
    if (!this.isApplicable(entity.constructor, entity, context)) {
      return;
    }

    const config = getBlameableConfig(entity.constructor);
    if (!config || !context.userId) return;

    // Set created by for new entities
    if (context.operation === "create" && config.trackCreation) {
      const createdByField = config.createdByField!;
      if (!entity[createdByField]) {
        entity[createdByField] = context.userId;
        this.logger.debug(
          `Set ${createdByField} for new ${context.entityType}`,
        );
      }
    }

    // Set updated by for create and update operations
    if (
      ["create", "update"].includes(context.operation) &&
      config.trackUpdates
    ) {
      const updatedByField = config.updatedByField!;
      entity[updatedByField] = context.userId;
      this.logger.debug(`Set ${updatedByField} for ${context.entityType}`);
    }

    // Set deleted by for delete operations
    if (context.operation === "delete" && config.trackDeletions) {
      const deletedByField = config.deletedByField!;
      entity[deletedByField] = context.userId;
      this.logger.debug(
        `Set ${deletedByField} for deleted ${context.entityType}`,
      );
    }

    // Maintain detailed history if enabled
    if (config.keepHistory && config.historyField) {
      await this.updateBlameHistory(entity, config, context);
    }

    // Track user relationships for complex blame scenarios
    if (config.trackRelationships) {
      await this.trackUserRelationships(entity, config, context);
    }
  }

  async beforeDelete(entity: any, context: BehaviorContext): Promise<void> {
    if (!this.isApplicable(entity.constructor, entity, context)) {
      return;
    }

    const config = getBlameableConfig(entity.constructor);
    if (!config || !context.userId) return;

    // Set deleted by for delete operations
    if (config.trackDeletions) {
      const deletedByField = config.deletedByField!;
      entity[deletedByField] = context.userId;
      this.logger.debug(
        `Set ${deletedByField} for deleted ${context.entityType}`,
      );
    }

    // Maintain detailed history if enabled
    if (config.keepHistory && config.historyField) {
      await this.updateBlameHistory(entity, config, context);
    }

    // Track user relationships for complex blame scenarios
    if (config.trackRelationships) {
      await this.trackUserRelationships(entity, config, context);
    }
  }

  isApplicable(
    entityClass: any,
    entity: any,
    context: BehaviorContext,
  ): boolean {
    return isBlameable(entityClass) && !!context.userId;
  }

  private async updateBlameHistoryAsync(
    entity: any,
    config: any,
    context: BehaviorContext,
  ): Promise<void> {
    // Enhanced blame history implementation with async processing
    return this.updateBlameHistory(entity, config, context);
  }

  private async updateBlameHistory(
    entity: any,
    config: any,
    context: BehaviorContext,
  ): Promise<void> {
    // Enhanced blame history implementation with async processing
    const historyField = config.historyField!;

    if (!entity[historyField]) {
      entity[historyField] = [];
    }

    // Enhanced blame history with user details and change tracking
    const historyEntry = {
      userId: context.userId,
      action: context.operation,
      timestamp: new Date(),
      userRole: context.metadata?.userRole,
      ipAddress: context.metadata?.ipAddress,
      userAgent: context.metadata?.userAgent,
      sessionId: context.metadata?.sessionId,
      changes: this.trackFieldChanges(entity, context),
      relatedEntities: await this.getRelatedEntityInfo(entity, context),
    };

    entity[historyField].push(historyEntry);

    // Maintain history size limit
    const maxHistorySize = config.maxHistorySize || 100;
    if (entity[historyField].length > maxHistorySize) {
      entity[historyField] = entity[historyField].slice(-maxHistorySize);
    }

    this.logger.debug(
      `Updated blame history for ${context.entityType} with ${Object.keys(historyEntry.changes || {}).length} field changes`,
    );
  }

  /**
   * Track user relationships for complex scenarios like delegation or proxy actions
   */
  private async trackUserRelationships(
    entity: any,
    config: any,
    context: BehaviorContext,
  ): Promise<void> {
    await Promise.resolve();
    if (
      !context.metadata?.originalUserId ||
      context.metadata.originalUserId === context.userId
    ) {
      return; // No delegation scenario
    }

    // Track the original user who initiated the action (e.g., admin acting on behalf of fitter)
    const relationshipField = config.relationshipField || "userRelationships";

    if (!entity[relationshipField]) {
      entity[relationshipField] = [];
    }

    entity[relationshipField].push({
      originalUserId: context.metadata.originalUserId,
      actingUserId: context.userId,
      relationshipType: context.metadata.relationshipType || "delegation",
      action: context.operation,
      timestamp: new Date(),
      reason: context.metadata.delegationReason,
    });

    this.logger.debug(
      `Tracked user relationship: ${context.metadata.originalUserId} → ${context.userId} for ${context.entityType}`,
    );
  }

  /**
   * Track specific field changes for detailed audit trail
   */
  private trackFieldChanges(
    entity: any,
    context: BehaviorContext,
  ): Record<string, { from: any; to: any }> {
    const changes: Record<string, { from: any; to: any }> = {};

    if (context.metadata?.originalEntity) {
      const original = context.metadata.originalEntity;

      // Compare relevant fields to track what actually changed
      Object.keys(entity).forEach((key) => {
        if (this.isTrackableField(key) && original[key] !== entity[key]) {
          changes[key] = {
            from: original[key],
            to: entity[key],
          };
        }
      });
    }

    return changes;
  }

  /**
   * Get information about related entities for context
   */
  private async getRelatedEntityInfo(
    entity: any,
    context: BehaviorContext,
  ): Promise<Array<{ type: string; id: string; relationship: string }>> {
    await Promise.resolve();
    const relatedEntities: Array<{
      type: string;
      id: string;
      relationship: string;
    }> = [];

    // Check for common relationship patterns
    const relationships = [
      { field: "customerId", type: "Customer", relationship: "belongs_to" },
      { field: "fitterId", type: "Fitter", relationship: "belongs_to" },
      { field: "supplierId", type: "Supplier", relationship: "belongs_to" },
      { field: "orderId", type: "Order", relationship: "belongs_to" },
      { field: "parentId", type: context.entityType, relationship: "parent" },
    ];

    relationships.forEach((rel) => {
      if (entity[rel.field]) {
        relatedEntities.push({
          type: rel.type,
          id: entity[rel.field],
          relationship: rel.relationship,
        });
      }
    });

    return relatedEntities;
  }

  /**
   * Determine if a field should be tracked for changes
   */
  private isTrackableField(fieldName: string): boolean {
    // Exclude system fields and large objects from change tracking
    const excludedFields = [
      "id",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "version",
      "createdBy",
      "updatedBy",
      "deletedBy",
      "blameHistory",
      "userRelationships",
      "metadata",
    ];

    return (
      !excludedFields.includes(fieldName) &&
      !fieldName.startsWith("_") &&
      !fieldName.includes("History") &&
      !fieldName.includes("metadata")
    );
  }

  /**
   * Get comprehensive user information for blame tracking
   */
  async getUserInfo(
    userId: string,
    context: BehaviorContext,
  ): Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  } | null> {
    try {
      if (!context.entityManager) return null;

      const userInfo = await context.entityManager.query(
        `
        SELECT u.id, u.email, u.first_name, u.last_name, r.name as role,
               CASE
                 WHEN f.id IS NOT NULL THEN 'Fitting'
                 WHEN s.id IS NOT NULL THEN 'Supply'
                 ELSE 'Administration'
               END as department
        FROM "user" u
        LEFT JOIN user_role ur ON u.id = ur.user_id
        LEFT JOIN role r ON ur.role_id = r.id
        LEFT JOIN fitter f ON u.id = f.user_id
        LEFT JOIN supplier s ON u.id = s.user_id
        WHERE u.id = $1
      `,
        [userId],
      );

      if (userInfo.length > 0) {
        const user = userInfo[0];
        return {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`.trim(),
          email: user.email,
          role: user.role || "User",
          department: user.department,
        };
      }

      return null;
    } catch (error) {
      this.logger.warn(
        `Failed to get user info for ${userId}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Generate blame report for an entity
   */
  async generateBlameReport(entity: any): Promise<{
    currentOwners: Array<{
      type: string;
      userId: string;
      name?: string;
      since: Date;
    }>;
    history: Array<{
      action: string;
      userId: string;
      name?: string;
      timestamp: Date;
      changes?: any;
    }>;
    relationships: Array<{
      originalUserId: string;
      actingUserId: string;
      type: string;
      timestamp: Date;
    }>;
  }> {
    await Promise.resolve();
    const config = getBlameableConfig(entity.constructor);
    if (!config) {
      return { currentOwners: [], history: [], relationships: [] };
    }

    const currentOwners: Array<{
      type: string;
      userId: string;
      name?: string;
      since: Date;
    }> = [];
    const history = config.historyField
      ? entity[config.historyField] || []
      : [];
    const relationships = config.relationshipField
      ? entity[config.relationshipField] || []
      : [];

    // Determine current owners
    if (config.createdByField && entity[config.createdByField]) {
      currentOwners.push({
        type: "creator",
        userId: entity[config.createdByField],
        since: entity.createdAt || new Date(),
      });
    }

    if (
      config.updatedByField &&
      entity[config.updatedByField] &&
      entity[config.updatedByField] !==
        (config.createdByField ? entity[config.createdByField] : null)
    ) {
      currentOwners.push({
        type: "last_modifier",
        userId: entity[config.updatedByField],
        since: entity.updatedAt || new Date(),
      });
    }

    return {
      currentOwners,
      history: history.map((h) => ({
        action: h.action,
        userId: h.userId,
        name: h.userName,
        timestamp: h.timestamp,
        changes: h.changes,
      })),
      relationships: relationships.map((r) => ({
        originalUserId: r.originalUserId,
        actingUserId: r.actingUserId,
        type: r.relationshipType,
        timestamp: r.timestamp,
      })),
    };
  }
}
