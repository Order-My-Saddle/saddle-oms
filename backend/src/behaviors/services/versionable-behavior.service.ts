import { Injectable, Logger } from "@nestjs/common";
import { BeforeSaveBehavior, BehaviorContext } from "../interfaces";
import { getVersionableConfig, isVersionable } from "../decorators";
import { createHash } from "crypto";

@Injectable()
export class VersionableBehavior implements BeforeSaveBehavior {
  private readonly logger = new Logger(VersionableBehavior.name);

  readonly name = "VersionableBehavior";
  readonly priority = 40;
  readonly autoApply = true;

  async beforeSave(entity: any, context: BehaviorContext): Promise<void> {
    await Promise.resolve();
    if (!this.isApplicable(entity.constructor, entity, context)) {
      return;
    }

    const config = getVersionableConfig(entity.constructor);
    if (!config) return;

    const versionField = config.versionField!;

    // Set initial version for new entities
    if (context.operation === "create") {
      if (!entity[versionField]) {
        entity[versionField] = config.initialVersion!;
        this.logger.debug(`Set initial version for new ${context.entityType}`);
      }
    }

    // Increment version for updates
    if (context.operation === "update" && config.autoIncrement) {
      const currentVersion = entity[versionField] || config.initialVersion!;
      entity[versionField] = config.incrementFunction!(currentVersion);
      this.logger.debug(
        `Incremented version for ${context.entityType} to ${entity[versionField]}`,
      );
    }

    // Calculate content hash if enabled
    if (config.trackContentHash && config.contentHashField) {
      const contentHash = this.calculateContentHash(entity, config);
      entity[config.contentHashField] = contentHash;
    }

    // Calculate checksum if enabled
    if (config.trackChecksum && config.checksumField) {
      const checksum = this.calculateChecksum(entity, config);
      entity[config.checksumField] = checksum;
    }

    // Maintain version history if enabled
    if (config.keepHistory && config.historyField) {
      this.updateVersionHistory(entity, config, context);
    }
  }

  isApplicable(
    entityClass: any,
    entity: any,
    context: BehaviorContext,
  ): boolean {
    void entity;
    void context;
    return isVersionable(entityClass);
  }

  private calculateContentHash(entity: any, config: any): string {
    const relevantData = { ...entity };

    // Remove excluded fields
    config.excludeFields?.forEach((field: string) => {
      delete relevantData[field];
    });

    const content = JSON.stringify(
      relevantData,
      Object.keys(relevantData).sort(),
    );
    return createHash(config.hashAlgorithm!).update(content).digest("hex");
  }

  private calculateChecksum(entity: any, config: any): string {
    return this.calculateContentHash(entity, config).substring(0, 8);
  }

  private updateVersionHistory(
    entity: any,
    config: any,
    context: BehaviorContext,
  ): void {
    const historyField = config.historyField!;

    if (!entity[historyField]) {
      entity[historyField] = [];
    }

    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    if (context.metadata?.originalEntity) {
      const original = context.metadata.originalEntity;

      Object.keys(entity).forEach((key) => {
        if (
          !config.excludeFields?.includes(key) &&
          original[key] !== entity[key]
        ) {
          changes.push({
            field: key,
            oldValue: original[key],
            newValue: entity[key],
          });
        }
      });
    }

    entity[historyField].push({
      version: entity[config.versionField!],
      timestamp: new Date(),
      userId: context.userId,
      changes,
      contentHash: entity[config.contentHashField!] || null,
    });

    // Limit history size
    const maxHistorySize = 50;
    if (entity[historyField].length > maxHistorySize) {
      entity[historyField] = entity[historyField].slice(-maxHistorySize);
    }
  }
}
