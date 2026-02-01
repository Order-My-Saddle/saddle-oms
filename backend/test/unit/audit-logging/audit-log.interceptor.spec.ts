import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, CallHandler } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { of, lastValueFrom } from "rxjs";
import { AuditLogInterceptor } from "../../../src/audit-logging/interceptors/audit-log.interceptor";
import { AuditLoggingService } from "../../../src/audit-logging/audit-logging.service";
import { AUDIT_LOG_KEY } from "../../../src/audit-logging/decorators/audit-log.decorator";

describe("AuditLogInterceptor", () => {
  let interceptor: AuditLogInterceptor;
  let auditLoggingService: jest.Mocked<AuditLoggingService>;
  let reflector: Reflector;

  const mockAuditLoggingService = {
    logAction: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogInterceptor,
        { provide: AuditLoggingService, useValue: mockAuditLoggingService },
        Reflector,
      ],
    }).compile();

    interceptor = module.get<AuditLogInterceptor>(AuditLogInterceptor);
    auditLoggingService = module.get(AuditLoggingService);
    reflector = module.get(Reflector);

    jest.clearAllMocks();
  });

  function createMockContext(overrides: {
    method?: string;
    url?: string;
    user?: any;
    params?: any;
    body?: any;
    handler?: Function;
  }): ExecutionContext {
    const handler = overrides.handler || (() => {});
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method: overrides.method || "GET",
          url: overrides.url || "/api/v1/orders",
          user: overrides.user,
          params: overrides.params || {},
          body: overrides.body || {},
        }),
        getResponse: () => ({}),
      }),
      getHandler: () => handler,
      getClass: () => ({}),
    } as any;
  }

  const mockCallHandler: CallHandler = {
    handle: () => of({ id: 123, status: 5 }),
  };

  it("should skip GET requests", async () => {
    const context = createMockContext({ method: "GET", user: { id: 1 } });
    const result$ = interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);
    expect(auditLoggingService.logAction).not.toHaveBeenCalled();
  });

  it("should skip HEAD requests", async () => {
    const context = createMockContext({ method: "HEAD", user: { id: 1 } });
    const result$ = interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);
    expect(auditLoggingService.logAction).not.toHaveBeenCalled();
  });

  it("should skip OPTIONS requests", async () => {
    const context = createMockContext({ method: "OPTIONS", user: { id: 1 } });
    const result$ = interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);
    expect(auditLoggingService.logAction).not.toHaveBeenCalled();
  });

  it("should skip unauthenticated requests", async () => {
    const context = createMockContext({ method: "POST", user: undefined });
    const result$ = interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);
    expect(auditLoggingService.logAction).not.toHaveBeenCalled();
  });

  it("should log POST requests", async () => {
    const context = createMockContext({
      method: "POST",
      url: "/api/v1/orders",
      user: { id: 42 },
    });
    const result$ = interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);

    // Allow fire-and-forget to resolve
    await new Promise((r) => setTimeout(r, 10));

    expect(auditLoggingService.logAction).toHaveBeenCalledWith(
      42,
      expect.stringContaining("Created Order"),
      123, // orderId is set from entityId for Order entity
      undefined,
      undefined,
      1,
      "Order",
      "123",
    );
  });

  it("should log PATCH requests with entity ID from params", async () => {
    const context = createMockContext({
      method: "PATCH",
      url: "/api/v1/customers/456",
      user: { id: 10 },
      params: { id: "456" },
    });
    const result$ = interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);

    await new Promise((r) => setTimeout(r, 10));

    expect(auditLoggingService.logAction).toHaveBeenCalledWith(
      10,
      expect.stringContaining("Updated Customer 456"),
      undefined,
      undefined,
      undefined,
      1,
      "Customer",
      "456",
    );
  });

  it("should log DELETE requests", async () => {
    const context = createMockContext({
      method: "DELETE",
      url: "/api/v1/fitters/789",
      user: { id: 5 },
      params: { id: "789" },
    });
    const result$ = interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);

    await new Promise((r) => setTimeout(r, 10));

    expect(auditLoggingService.logAction).toHaveBeenCalledWith(
      5,
      expect.stringContaining("Deleted Fitter 789"),
      undefined,
      undefined,
      undefined,
      1,
      "Fitter",
      "789",
    );
  });

  it("should use decorator metadata for entity type", async () => {
    const handler = () => {};
    jest.spyOn(reflector, "get").mockImplementation((key, target) => {
      if (key === AUDIT_LOG_KEY && target === handler) {
        return { entity: "Order", action: "cancel_order" };
      }
      return undefined;
    });

    const context = createMockContext({
      method: "PATCH",
      url: "/api/v1/orders/100/cancel",
      user: { id: 1 },
      params: { id: "100" },
      handler,
    });

    const result$ = interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);

    await new Promise((r) => setTimeout(r, 10));

    expect(auditLoggingService.logAction).toHaveBeenCalledWith(
      1,
      expect.stringContaining("cancel_order"),
      100,
      undefined,
      undefined,
      1,
      "Order",
      "100",
    );
  });

  it("should capture order status changes when trackStatusChange is true", async () => {
    const handler = () => {};
    jest.spyOn(reflector, "get").mockImplementation((key, target) => {
      if (key === AUDIT_LOG_KEY && target === handler) {
        return { entity: "Order", action: "update_order", trackStatusChange: true };
      }
      return undefined;
    });

    const request = {
      method: "PATCH",
      url: "/api/v1/orders/200",
      user: { id: 3 },
      params: { id: "200" },
      body: { status: 5 },
      __auditContext: { previousStatus: 2 },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
      }),
      getHandler: () => handler,
      getClass: () => ({}),
    } as any;

    const result$ = interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);

    await new Promise((r) => setTimeout(r, 10));

    expect(auditLoggingService.logAction).toHaveBeenCalledWith(
      3,
      expect.stringContaining("update_order"),
      200,
      2,
      5,
      1,
      "Order",
      "200",
    );
  });

  it("should silently catch logAction failures", async () => {
    mockAuditLoggingService.logAction.mockRejectedValueOnce(
      new Error("DB connection error"),
    );

    const context = createMockContext({
      method: "POST",
      url: "/api/v1/orders",
      user: { id: 1 },
    });

    const result$ = interceptor.intercept(context, mockCallHandler);
    // Should not throw
    const result = await lastValueFrom(result$);
    expect(result).toEqual({ id: 123, status: 5 });

    await new Promise((r) => setTimeout(r, 10));
    expect(auditLoggingService.logAction).toHaveBeenCalled();
  });

  it("should handle string user IDs", async () => {
    const context = createMockContext({
      method: "POST",
      url: "/api/v1/extras",
      user: { id: "abc-uuid" },
    });

    const result$ = interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);

    await new Promise((r) => setTimeout(r, 10));

    // parseInt("abc-uuid") is NaN, fallback to 0
    expect(auditLoggingService.logAction).toHaveBeenCalledWith(
      0,
      expect.any(String),
      undefined,
      undefined,
      undefined,
      1,
      "Extra",
      expect.any(String),
    );
  });

  it("should infer entity from route when no decorator", async () => {
    const context = createMockContext({
      method: "POST",
      url: "/api/v1/warehouses",
      user: { id: 7 },
    });

    const result$ = interceptor.intercept(context, mockCallHandler);
    await lastValueFrom(result$);

    await new Promise((r) => setTimeout(r, 10));

    expect(auditLoggingService.logAction).toHaveBeenCalledWith(
      7,
      expect.stringContaining("Warehouse"),
      undefined,
      undefined,
      undefined,
      1,
      "Warehouse",
      "123",
    );
  });
});
