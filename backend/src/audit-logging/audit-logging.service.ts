import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { AuditLogRepository } from "./infrastructure/persistence/relational/repositories/audit-log.repository";
import { AuditLogEntity } from "./infrastructure/persistence/relational/entities/audit-log.entity";
import { CreateAuditLogDto } from "./dto/create-audit-log.dto";
import { AuditLogDto } from "./dto/audit-log.dto";
import { QueryAuditLogDto } from "./dto/query-audit-log.dto";
import { PaginatedResponseDto } from "../common/dto/base-query.dto";
import { plainToInstance } from "class-transformer";

/**
 * AuditLogging Application Service
 *
 * Handles high-performance audit logging operations for 764K+ production records.
 * Optimized for search, filtering, and analysis of user actions and system events.
 */
@Injectable()
export class AuditLoggingService {
  private readonly logger = new Logger(AuditLoggingService.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  /**
   * Create a new audit log entry
   * Used both for new events and legacy data migration
   */
  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLogDto> {
    try {
      const auditLogEntity = this.createEntityFromDto(createAuditLogDto);
      const savedEntity = await this.auditLogRepository.save(auditLogEntity);

      this.logger.debug(
        `Created audit log entry: ${savedEntity.id} for user ${savedEntity.userId}`,
      );

      return this.toDto(savedEntity);
    } catch (error) {
      this.logger.error(
        `Failed to create audit log: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to create audit log entry");
    }
  }

  /**
   * Find audit log by ID
   */
  async findOne(id: number): Promise<AuditLogDto> {
    const auditLog = await this.auditLogRepository.findById(id);

    if (!auditLog) {
      throw new NotFoundException("Audit log entry not found");
    }

    return this.toDto(auditLog);
  }

  /**
   * Search audit logs with high-performance filtering and pagination
   * Optimized for handling large datasets (764K+ records)
   */
  async findAll(
    queryDto: QueryAuditLogDto,
  ): Promise<PaginatedResponseDto<AuditLogDto>> {
    try {
      this.logger.debug(
        `Searching audit logs with filters: ${JSON.stringify(queryDto.getAuditLogFilters())}`,
      );

      const result = await this.auditLogRepository.findManyWithQuery(queryDto);

      // Convert entities to DTOs
      const dtos = result.data.map((entity) => this.toDto(entity));

      return {
        data: dtos,
        meta: result.meta,
      };
    } catch (error) {
      this.logger.error(
        `Failed to search audit logs: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to search audit logs");
    }
  }

  /**
   * Get audit trail for a specific order
   * Essential for order compliance and debugging
   */
  async getOrderAuditTrail(
    orderId: number,
    page = 1,
    limit = 50,
  ): Promise<PaginatedResponseDto<AuditLogDto>> {
    try {
      const offset = (page - 1) * limit;
      const result = await this.auditLogRepository.findByOrderId(
        orderId,
        limit,
        offset,
      );

      const dtos = result.items.map((entity) => this.toDto(entity));

      return {
        data: dtos,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          hasNextPage: page < Math.ceil(result.total / limit),
          count: dtos.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get audit trail for order ${orderId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to get order audit trail");
    }
  }

  /**
   * Get audit trail for a specific user
   * Useful for user activity analysis and compliance
   */
  async getUserAuditTrail(
    userId: number,
    page = 1,
    limit = 100,
  ): Promise<PaginatedResponseDto<AuditLogDto>> {
    try {
      const offset = (page - 1) * limit;
      const result = await this.auditLogRepository.findByUserId(
        userId,
        limit,
        offset,
      );

      const dtos = result.items.map((entity) => this.toDto(entity));

      return {
        data: dtos,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          hasNextPage: page < Math.ceil(result.total / limit),
          count: dtos.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get audit trail for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to get user audit trail");
    }
  }

  /**
   * Get status change history
   * Critical for tracking order progression and compliance
   */
  async getStatusChangeHistory(
    orderId?: number,
    fromStatus?: number,
    toStatus?: number,
    page = 1,
    limit = 50,
  ): Promise<PaginatedResponseDto<AuditLogDto>> {
    try {
      const offset = (page - 1) * limit;
      const result = await this.auditLogRepository.findStatusChanges(
        orderId,
        fromStatus,
        toStatus,
        limit,
        offset,
      );

      const dtos = result.items.map((entity) => this.toDto(entity));

      return {
        data: dtos,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
          hasNextPage: page < Math.ceil(result.total / limit),
          count: dtos.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get status change history: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to get status change history");
    }
  }

  /**
   * Get audit statistics for dashboard and reporting
   */
  async getAuditStatistics(
    fromDate?: Date,
    toDate?: Date,
  ): Promise<{
    totalLogs: number;
    statusChanges: number;
    uniqueUsers: number;
    uniqueOrders: number;
    topActions: Array<{ action: string; count: number }>;
  }> {
    try {
      return await this.auditLogRepository.getAuditStatistics(fromDate, toDate);
    } catch (error) {
      this.logger.error(
        `Failed to get audit statistics: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to get audit statistics");
    }
  }

  /**
   * Bulk create audit logs for migration
   * Optimized for importing 764K+ legacy records
   */
  async bulkCreate(
    createAuditLogDtos: CreateAuditLogDto[],
  ): Promise<{ created: number; skipped: number }> {
    try {
      this.logger.log(
        `Starting bulk creation of ${createAuditLogDtos.length} audit log entries`,
      );

      const entities = createAuditLogDtos.map((dto) =>
        this.createEntityFromDto(dto),
      );
      await this.auditLogRepository.bulkInsert(entities);

      this.logger.log(
        `Successfully bulk created ${createAuditLogDtos.length} audit log entries`,
      );

      return {
        created: createAuditLogDtos.length,
        skipped: 0, // Repository handles deduplication
      };
    } catch (error) {
      this.logger.error(
        `Failed to bulk create audit logs: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to bulk create audit logs");
    }
  }

  /**
   * Log a new system action (convenience method for real-time logging)
   */
  async logAction(
    userId: number,
    action: string,
    orderId?: number,
    orderStatusFrom?: number,
    orderStatusTo?: number,
    userType = 1,
    entityType?: string,
    entityId?: string,
  ): Promise<AuditLogDto> {
    const createDto: CreateAuditLogDto = {
      userId,
      userType,
      orderId,
      action,
      orderStatusFrom,
      orderStatusTo,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
    };

    return this.create(createDto);
  }

  /**
   * Archive old audit logs (retention management)
   * Move logs older than specified date to archive
   */
  async archiveOldLogs(beforeDate: Date): Promise<{ archived: number }> {
    try {
      this.logger.log(
        `Archiving audit logs older than ${beforeDate.toISOString()}`,
      );

      // Implementation would move old logs to archive table
      // For now, this is a placeholder for the archiving logic
      await Promise.resolve(); // Placeholder for future async operation

      this.logger.log("Audit log archiving completed");

      return { archived: 0 }; // Placeholder
    } catch (error) {
      this.logger.error(
        `Failed to archive audit logs: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException("Failed to archive audit logs");
    }
  }

  /**
   * Convert DTO to entity
   */
  private createEntityFromDto(createDto: CreateAuditLogDto): AuditLogEntity {
    const entity = new AuditLogEntity();
    entity.userId = createDto.userId;
    entity.userType = createDto.userType;
    entity.orderId = createDto.orderId || null;
    entity.action = createDto.action;
    entity.orderStatusFrom = createDto.orderStatusFrom || null;
    entity.orderStatusTo = createDto.orderStatusTo || null;
    entity.entityType = createDto.entityType || null;
    entity.entityId = createDto.entityId || null;
    entity.timestamp = new Date(createDto.timestamp);

    return entity;
  }

  /**
   * Convert entity to DTO
   */
  private toDto(entity: AuditLogEntity): AuditLogDto {
    return plainToInstance(AuditLogDto, {
      id: entity.id,
      userId: entity.userId,
      userType: entity.userType,
      orderId: entity.orderId,
      action: entity.action,
      orderStatusFrom: entity.orderStatusFrom,
      orderStatusTo: entity.orderStatusTo,
      entityType: entity.entityType,
      entityId: entity.entityId,
      timestamp:
        entity.timestamp instanceof Date
          ? entity.timestamp.toISOString()
          : entity.timestamp,
      createdAt:
        entity.createdAt instanceof Date
          ? entity.createdAt.toISOString()
          : entity.createdAt,
    });
  }
}
