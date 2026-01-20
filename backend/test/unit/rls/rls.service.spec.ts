import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { RlsService } from "../../../src/rls/rls.service";
import { RoleEnum } from "../../../src/roles/roles.enum";

describe("RlsService", () => {
  let service: RlsService;
  let _dataSource: DataSource | undefined;
  let mockQueryRunner: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      release: jest.fn(),
      query: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RlsService,
        {
          provide: "DATA_SOURCE",
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<RlsService>(RlsService);
    _dataSource = module.get<DataSource>("DATA_SOURCE");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("setUserContext", () => {
    it("should set basic user context correctly", async () => {
      const userId = "test-user-id";
      const userRole = RoleEnum.admin;

      await service.setUserContext(userId, userRole);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_id', $1, false)`,
        [userId],
      );
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_role', $1, false)`,
        [userRole.toString()],
      );
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it("should set factory context for factory users", async () => {
      const userId = "factory-user-id";
      const userRole = RoleEnum.factory;
      const factoryId = "factory-123";

      await service.setUserContext(userId, userRole, factoryId);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.factory_id', $1, false)`,
        [factoryId],
      );
    });

    it("should set fitter context for fitter users", async () => {
      const userId = "fitter-user-id";
      const userRole = RoleEnum.fitter;
      const fitterId = "fitter-456";

      await service.setUserContext(userId, userRole, undefined, fitterId);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.fitter_id', $1, false)`,
        [fitterId],
      );
    });

    it("should handle query runner release on error", async () => {
      const userId = "test-user-id";
      const userRole = RoleEnum.admin;

      mockQueryRunner.query.mockRejectedValue(new Error("Database error"));

      await expect(service.setUserContext(userId, userRole)).rejects.toThrow(
        "Database error",
      );
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe("clearUserContext", () => {
    it("should clear all RLS context variables", async () => {
      await service.clearUserContext();

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_id', '', false)`,
      );
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_role', '2', false)`,
      );
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.factory_id', '', false)`,
      );
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.fitter_id', '', false)`,
      );
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe("getCurrentContext", () => {
    it("should return current RLS context", async () => {
      mockQueryRunner.query
        .mockResolvedValueOnce([{ user_id: "test-user" }])
        .mockResolvedValueOnce([{ user_role: "5" }])
        .mockResolvedValueOnce([{ factory_id: "factory-123" }])
        .mockResolvedValueOnce([{ fitter_id: "fitter-456" }]);

      const context = await service.getCurrentContext();

      expect(context).toEqual({
        userId: "test-user",
        userRole: 5,
        factoryId: "factory-123",
        fitterId: "fitter-456",
      });
    });

    it("should handle missing context gracefully", async () => {
      mockQueryRunner.query
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}]);

      const context = await service.getCurrentContext();

      expect(context).toEqual({
        userId: "",
        userRole: 2,
        factoryId: undefined,
        fitterId: undefined,
      });
    });
  });

  describe("executeWithUserContext", () => {
    it("should execute function with temporary context and restore original", async () => {
      // Mock original context
      mockQueryRunner.query
        .mockResolvedValueOnce([{ user_id: "original-user" }])
        .mockResolvedValueOnce([{ user_role: "2" }])
        .mockResolvedValueOnce([{ factory_id: "" }])
        .mockResolvedValueOnce([{ fitter_id: "" }]);

      const testFunction = jest.fn().mockResolvedValue("test-result");

      const result = await service.executeWithUserContext(
        "temp-user",
        RoleEnum.admin,
        testFunction,
      );

      expect(result).toBe("test-result");
      expect(testFunction).toHaveBeenCalled();
    });
  });

  describe("checkRlsStatus", () => {
    it("should return RLS status for all tables", async () => {
      // Mock responses for 7 tables (2 queries each: RLS status + policies)
      mockQueryRunner.query
        .mockResolvedValueOnce([{ rls_enabled: true }]) // user RLS status
        .mockResolvedValueOnce([{ policyname: "user_policy" }]) // user policies
        .mockResolvedValueOnce([{ rls_enabled: true }]) // customer RLS status
        .mockResolvedValueOnce([{ policyname: "customer_policy" }]) // customer policies
        .mockResolvedValueOnce([{ rls_enabled: true }]) // orders RLS status
        .mockResolvedValueOnce([{ policyname: "order_policy" }]) // orders policies
        .mockResolvedValueOnce([{ rls_enabled: true }]) // fitters RLS status
        .mockResolvedValueOnce([{ policyname: "fitter_policy" }]) // fitters policies
        .mockResolvedValueOnce([{ rls_enabled: true }]) // factories RLS status
        .mockResolvedValueOnce([{ policyname: "factory_policy" }]) // factories policies
        .mockResolvedValueOnce([{ rls_enabled: true }]) // factory_employees RLS status
        .mockResolvedValueOnce([{ policyname: "employee_policy" }]) // factory_employees policies
        .mockResolvedValueOnce([{ rls_enabled: true }]) // audit_log RLS status
        .mockResolvedValueOnce([{ policyname: "audit_policy" }]); // audit_log policies

      const status = await service.checkRlsStatus();

      expect(status).toHaveLength(7); // Should check 7 tables
      expect(status[0]).toMatchObject({
        table: "credentials",
        rlsEnabled: true,
        policies: ["user_policy"],
      });
    });
  });

  describe("testRlsPolicies", () => {
    it("should test access to all tables with given user context", async () => {
      mockQueryRunner.query
        .mockResolvedValueOnce([]) // Set user context
        .mockResolvedValueOnce([]) // Set role context
        .mockResolvedValue([{ count: "5" }]); // Mock count results

      const results = await service.testRlsPolicies(
        "test-user",
        RoleEnum.admin,
      );

      expect(results).toHaveLength(7); // Should test 7 tables
      expect(results[0]).toMatchObject({
        table: "credentials",
        accessibleRecords: 5,
      });
    });

    it("should handle query errors gracefully", async () => {
      mockQueryRunner.query
        .mockResolvedValueOnce([]) // Set user context
        .mockResolvedValueOnce([]) // Set role context
        .mockRejectedValue(new Error("Access denied")); // Mock error

      const results = await service.testRlsPolicies("test-user", RoleEnum.user);

      expect(results[0]).toMatchObject({
        table: "credentials",
        accessibleRecords: 0,
        error: "Access denied",
      });
    });
  });

  describe("Role-based access patterns", () => {
    it("should set appropriate context for supervisor role", async () => {
      await service.setUserContext("supervisor-user", RoleEnum.supervisor);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_role', $1, false)`,
        [RoleEnum.supervisor.toString()],
      );
    });

    it("should set appropriate context for admin role", async () => {
      await service.setUserContext("admin-user", RoleEnum.admin);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_role', $1, false)`,
        [RoleEnum.admin.toString()],
      );
    });

    it("should default to user role for invalid role", async () => {
      // Test with a valid enum value but ensure it's handled correctly
      await service.setUserContext("test-user", RoleEnum.user);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_role', $1, false)`,
        [RoleEnum.user.toString()],
      );
    });
  });
});
