import { SetMetadata } from "@nestjs/common";

/**
 * Decorator to mark an entity as versionable (optimistic locking)
 * Migration from PHP VersionableTrait
 */
export const VERSIONABLE_METADATA = "versionable:config";

export interface VersionableOptions {
  /**
   * Field name for storing version number
   * @default 'version'
   */
  versionField?: string;

  /**
   * Field name for storing content hash
   * @default 'contentHash'
   */
  contentHashField?: string;

  /**
   * Field name for storing checksum
   * @default 'checksum'
   */
  checksumField?: string;

  /**
   * Starting version number for new entities
   * @default 1
   */
  initialVersion?: number;

  /**
   * Whether to automatically increment version on updates
   * @default true
   */
  autoIncrement?: boolean;

  /**
   * Whether to calculate and store content hash
   * @default false
   */
  trackContentHash?: boolean;

  /**
   * Whether to calculate and store checksum
   * @default false
   */
  trackChecksum?: boolean;

  /**
   * Whether to maintain version history
   * @default false
   */
  keepHistory?: boolean;

  /**
   * Field name for storing version history
   * @default 'versionHistory'
   */
  historyField?: string;

  /**
   * Fields to exclude from version calculation
   */
  excludeFields?: string[];

  /**
   * Custom hash algorithm
   * @default 'sha256'
   */
  hashAlgorithm?: "md5" | "sha1" | "sha256" | "sha512";

  /**
   * Custom version increment function
   */
  incrementFunction?: (currentVersion: number) => number;
}

/**
 * Versionable decorator for optimistic locking
 *
 * @example
 * ```typescript
 * @Entity()
 * @Versionable()
 * export class User {
 *   @PrimaryGeneratedColumn()
 *   id: number;
 *
 *   @Column()
 *   name: string;
 *
 *   // This field will be automatically managed
 *   @VersionColumn()
 *   version: number;
 * }
 * ```
 *
 * @example With content tracking
 * ```typescript
 * @Entity()
 * @Versionable({
 *   trackContentHash: true,
 *   trackChecksum: true,
 *   keepHistory: true
 * })
 * export class Document {
 *   @Column()
 *   version: number;
 *
 *   @Column({ nullable: true })
 *   contentHash?: string;
 *
 *   @Column({ nullable: true })
 *   checksum?: string;
 *
 *   @Column('json', { nullable: true })
 *   versionHistory?: any[];
 * }
 * ```
 */
export function Versionable(options: VersionableOptions = {}): ClassDecorator {
  const config: VersionableOptions = {
    versionField: "version",
    contentHashField: "contentHash",
    checksumField: "checksum",
    initialVersion: 1,
    autoIncrement: true,
    trackContentHash: false,
    trackChecksum: false,
    keepHistory: false,
    historyField: "versionHistory",
    excludeFields: [
      "createdAt",
      "updatedAt",
      "version",
      "contentHash",
      "checksum",
    ],
    hashAlgorithm: "sha256",
    incrementFunction: (version) => version + 1,
    ...options,
  };

  return SetMetadata(VERSIONABLE_METADATA, config);
}

/**
 * Get versionable configuration from entity class
 */
export function getVersionableConfig(
  target: any,
): VersionableOptions | undefined {
  return Reflect.getMetadata(VERSIONABLE_METADATA, target);
}

/**
 * Check if entity has versionable behavior
 */
export function isVersionable(target: any): boolean {
  return Reflect.hasMetadata(VERSIONABLE_METADATA, target);
}
