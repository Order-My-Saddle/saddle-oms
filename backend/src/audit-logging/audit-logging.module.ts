import { Module } from "@nestjs/common";
import { AuditLoggingService } from "./audit-logging.service";
import { DatabaseQueryLogService } from "./database-query-log.service";
import { AuditLoggingController } from "./audit-logging.controller";
import { DatabaseQueryLogController } from "./database-query-log.controller";
import { AuditLoggingRelationalPersistenceModule } from "./infrastructure/persistence/relational/relational-persistence.module";
import { AuditLogInterceptor } from "./interceptors/audit-log.interceptor";

@Module({
  imports: [AuditLoggingRelationalPersistenceModule],
  controllers: [AuditLoggingController, DatabaseQueryLogController],
  providers: [
    AuditLoggingService,
    DatabaseQueryLogService,
    AuditLogInterceptor,
  ],
  exports: [
    AuditLoggingService,
    DatabaseQueryLogService,
    AuditLoggingRelationalPersistenceModule,
    AuditLogInterceptor,
  ],
})
export class AuditLoggingModule {}
