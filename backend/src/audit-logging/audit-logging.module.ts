import { Module } from "@nestjs/common";
import { AuditLoggingService } from "./audit-logging.service";
import { DatabaseQueryLogService } from "./database-query-log.service";
import { AuditLoggingController } from "./audit-logging.controller";
import { DatabaseQueryLogController } from "./database-query-log.controller";
import { AuditLoggingRelationalPersistenceModule } from "./infrastructure/persistence/relational/relational-persistence.module";

/**
 * Audit Logging Module
 *
 * Comprehensive audit logging system for the OMS application.
 * Handles migration and management of 839K+ production audit records:
 * - 764,381 application audit logs
 * - 74,939 database query logs
 *
 * Features:
 * - High-performance search and filtering
 * - Admin-only access control
 * - Compliance audit trails
 * - Performance analysis and optimization insights
 * - Legacy data migration support
 * - Real-time logging capabilities
 */
@Module({
  imports: [AuditLoggingRelationalPersistenceModule],
  controllers: [AuditLoggingController, DatabaseQueryLogController],
  providers: [AuditLoggingService, DatabaseQueryLogService],
  exports: [
    AuditLoggingService,
    DatabaseQueryLogService,
    AuditLoggingRelationalPersistenceModule,
  ],
})
export class AuditLoggingModule {}
