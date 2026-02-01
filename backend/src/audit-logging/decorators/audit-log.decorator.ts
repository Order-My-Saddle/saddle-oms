import { SetMetadata } from "@nestjs/common";

export interface AuditLogOptions {
  entity: string;
  action?: string;
  idParam?: string;
  trackStatusChange?: boolean;
}

export const AUDIT_LOG_KEY = "audit_log_metadata";

export const AuditLog = (options: AuditLogOptions) =>
  SetMetadata(AUDIT_LOG_KEY, options);
