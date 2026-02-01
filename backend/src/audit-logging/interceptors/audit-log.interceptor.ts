import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditLoggingService } from "../audit-logging.service";
import { AUDIT_LOG_KEY, AuditLogOptions } from "../decorators/audit-log.decorator";
import { inferEntityFromRoute } from "../utils/route-entity-map";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly auditLoggingService: AuditLoggingService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method;

    if (!MUTATION_METHODS.has(method)) {
      return next.handle();
    }

    const user = request.user;
    if (!user) {
      return next.handle();
    }

    const metadata = this.reflector.get<AuditLogOptions | undefined>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      tap((responseData) => {
        this.logAuditEntry(request, method, user, metadata, responseData).catch(
          (err) => {
            this.logger.warn(`Audit log failed: ${err.message}`);
          },
        );
      }),
    );
  }

  private async logAuditEntry(
    request: any,
    method: string,
    user: any,
    metadata: AuditLogOptions | undefined,
    responseData: any,
  ): Promise<void> {
    const entityType =
      metadata?.entity || inferEntityFromRoute(request.url) || "Unknown";

    const idParam = metadata?.idParam || "id";
    const entityId =
      request.params?.[idParam] ||
      responseData?.id ||
      responseData?.data?.id ||
      undefined;

    const action = metadata?.action || this.buildAction(method, entityType);

    let orderStatusFrom: number | undefined;
    let orderStatusTo: number | undefined;
    let orderId: number | undefined;

    if (entityType === "Order") {
      orderId = entityId ? parseInt(entityId, 10) : undefined;
      if (
        metadata?.trackStatusChange &&
        request.__auditContext?.previousStatus !== undefined
      ) {
        orderStatusFrom = request.__auditContext.previousStatus;
        orderStatusTo =
          request.body?.status ?? responseData?.status ?? undefined;
      }
    }

    const actionDescription = entityId
      ? `${action} ${entityId}`
      : action;

    await this.auditLoggingService.logAction(
      typeof user.id === "string" ? parseInt(user.id, 10) || 0 : user.id,
      actionDescription,
      orderId,
      orderStatusFrom,
      orderStatusTo,
      1, // userType default
      entityType,
      entityId ? String(entityId) : undefined,
    );
  }

  private buildAction(method: string, entityType: string): string {
    switch (method) {
      case "POST":
        return `Created ${entityType}`;
      case "PUT":
      case "PATCH":
        return `Updated ${entityType}`;
      case "DELETE":
        return `Deleted ${entityType}`;
      default:
        return `${method} ${entityType}`;
    }
  }
}
