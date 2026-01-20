import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLogEntity } from "./entities/audit-log.entity";
import { DatabaseQueryLogEntity } from "./entities/database-query-log.entity";
import { AuditLogRepository } from "./repositories/audit-log.repository";
import { DatabaseQueryLogRepository } from "./repositories/database-query-log.repository";

/**
 * Audit Logging Relational Persistence Module
 *
 * Configures TypeORM entities and repositories for audit logging functionality.
 * Optimized for handling large datasets (839K+ total records) with proper indexing.
 */
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity, DatabaseQueryLogEntity])],
  providers: [AuditLogRepository, DatabaseQueryLogRepository],
  exports: [AuditLogRepository, DatabaseQueryLogRepository, TypeOrmModule],
})
export class AuditLoggingRelationalPersistenceModule {}
