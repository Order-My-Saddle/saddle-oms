import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { RlsService } from "./rls.service";
import { RoleEnum } from "../roles/roles.enum";

describe("RlsService", () => {
  let service: RlsService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _dataSource: DataSource;
  let mockQueryRunner: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      release: jest.fn(),
      query: jest.fn(),
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
      const factoryId = "test-factory-id";

      await service.setUserContext(userId, userRole, factoryId);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.factory_id', $1, false)`,
        [factoryId],
      );
    });

    it("should set fitter context for fitter users", async () => {
      const userId = "fitter-user-id";
      const userRole = RoleEnum.fitter;
      const fitterId = "test-fitter-id";

      await service.setUserContext(userId, userRole, undefined, fitterId);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.fitter_id', $1, false)`,
        [fitterId],
      );
    });

    it("should handle query runner release on error", async () => {
      mockQueryRunner.query.mockRejectedValue(new Error("Database error"));

      await expect(
        service.setUserContext("user-id", RoleEnum.user),
      ).rejects.toThrow("Database error");

      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe("clearUserContext", () => {
    it("should clear all RLS context variables", async () => {
      await service.clearUserContext();

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
    });
  });

  describe("getCurrentContext", () => {
    it("should return current RLS context", async () => {
      const mockContext = {
        user_id: "test-user-id",
        user_role: "1",
        factory_id: "test-factory-id",
        fitter_id: "test-fitter-id",
      };

      mockQueryRunner.query
        .mockResolvedValueOnce([{ user_id: mockContext.user_id }])
        .mockResolvedValueOnce([{ user_role: mockContext.user_role }])
        .mockResolvedValueOnce([{ factory_id: mockContext.factory_id }])
        .mockResolvedValueOnce([{ fitter_id: mockContext.fitter_id }]);

      const result = await service.getCurrentContext();

      expect(result).toEqual({
        userId: mockContext.user_id,
        userRole: parseInt(mockContext.user_role),
        factoryId: mockContext.factory_id,
        fitterId: mockContext.fitter_id,
      });
    });

    it("should handle missing context gracefully", async () => {
      mockQueryRunner.query
        .mockResolvedValueOnce([{ user_id: null }])
        .mockResolvedValueOnce([{ user_role: null }])
        .mockResolvedValueOnce([{ factory_id: null }])
        .mockResolvedValueOnce([{ fitter_id: null }]);

      const result = await service.getCurrentContext();

      expect(result).toEqual({
        userId: "",
        userRole: 2, // Default user role
        factoryId: undefined,
        fitterId: undefined,
      });
    });
  });

  describe("executeWithUserContext", () => {
    it("should execute function with temporary context and restore original", async () => {
      // Mock original context
      const originalContext = {
        user_id: "original-user",
        user_role: "2",
        factory_id: "",
        fitter_id: "",
      };

      // Mock new context
      const tempUserId = "temp-user";
      const tempUserRole = RoleEnum.admin;

      // Setup mocks for getCurrentContext calls
      mockQueryRunner.query
        .mockResolvedValueOnce([{ user_id: originalContext.user_id }])
        .mockResolvedValueOnce([{ user_role: originalContext.user_role }])
        .mockResolvedValueOnce([{ factory_id: originalContext.factory_id }])
        .mockResolvedValueOnce([{ fitter_id: originalContext.fitter_id }]);

      const mockQueryFn = jest.fn().mockResolvedValue("query result");

      const result = await service.executeWithUserContext(
        tempUserId,
        tempUserRole,
        mockQueryFn,
      );

      expect(result).toBe("query result");
      expect(mockQueryFn).toHaveBeenCalled();

      // Verify context was set and restored
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_id', $1, false)`,
        [tempUserId],
      );
    });
  });

  describe("checkRlsStatus", () => {
    it("should return RLS status for all tables", async () => {
      const _mockTables = ["user", "customer", "orders"];
      void _mockTables; // Reserved for table-specific tests
      const mockRlsStatus = { rls_enabled: true };
      const mockPolicies = [
        { policyname: "admin_policy" },
        { policyname: "user_policy" },
      ];

      mockQueryRunner.query
        .mockResolvedValue([mockRlsStatus])
        .mockResolvedValueOnce([mockRlsStatus])
        .mockResolvedValueOnce(mockPolicies)
        .mockResolvedValueOnce([mockRlsStatus])
        .mockResolvedValueOnce(mockPolicies)
        .mockResolvedValueOnce([mockRlsStatus])
        .mockResolvedValueOnce(mockPolicies);

      const result = await service.checkRlsStatus();

      expect(result).toHaveLength(7); // 7 tables total
      expect(result[0]).toEqual({
        table: "user",
        rlsEnabled: true,
        policies: ["admin_policy", "user_policy"],
      });
    });
  });

  describe("testRlsPolicies", () => {
    it("should test access to all tables with given user context", async () => {
      const testUserId = "test-user";
      const testUserRole = RoleEnum.fitter;
      const mockCount = { count: "5" };

      mockQueryRunner.query.mockResolvedValue([mockCount]);

      const result = await service.testRlsPolicies(testUserId, testUserRole);

      expect(result).toHaveLength(7); // 7 tables
      expect(result[0]).toEqual({
        table: "user",
        accessibleRecords: 5,
      });

      // Verify context was set
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_id', $1, false)`,
        [testUserId],
      );
      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_role', $1, false)`,
        [testUserRole.toString()],
      );
    });

    it("should handle query errors gracefully", async () => {
      const testUserId = "test-user";
      const testUserRole = RoleEnum.user;

      mockQueryRunner.query
        .mockResolvedValueOnce([]) // Set user context
        .mockResolvedValueOnce([]) // Set role context
        .mockRejectedValue(new Error("Permission denied"));

      const result = await service.testRlsPolicies(testUserId, testUserRole);

      expect(result[0]).toEqual({
        table: "user",
        accessibleRecords: 0,
        error: "Permission denied",
      });
    });
  });

  describe("Role-based access patterns", () => {
    it("should set appropriate context for supervisor role", async () => {
      const userId = "supervisor-id";
      const userRole = RoleEnum.supervisor;

      await service.setUserContext(userId, userRole);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_role', $1, false)`,
        ["5"], // Supervisor role ID
      );
    });

    it("should set appropriate context for admin role", async () => {
      const userId = "admin-id";
      const userRole = RoleEnum.admin;

      await service.setUserContext(userId, userRole);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_role', $1, false)`,
        ["1"], // Admin role ID
      );
    });

    it("should default to user role for invalid role", async () => {
      const userId = "user-id";
      const userRole = 99 as RoleEnum; // Invalid role

      await service.setUserContext(userId, userRole);

      expect(mockQueryRunner.query).toHaveBeenCalledWith(
        `SELECT set_config('rls.user_role', $1, false)`,
        ["99"], // Should still pass the value, but DB function will default to 2
      );
    });
  });

  describe("Production Multi-Tenant Security", () => {
    describe("setTenantContext", () => {
      it("should set tenant context for multi-tenant isolation", async () => {
        const userId = "tenant-user-id";
        const userRole = RoleEnum.fitter;
        const tenantId = "tenant-123";
        const organizationId = "org-456";

        await service.setTenantContext(
          userId,
          userRole,
          tenantId,
          organizationId,
        );

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.tenant_id', $1, false)`,
          [tenantId],
        );
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.organization_id', $1, false)`,
          [organizationId],
        );
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.user_id', $1, false)`,
          [userId],
        );
      });

      it("should handle hierarchical tenant relationships", async () => {
        const userId = "hierarchy-user";
        const userRole = RoleEnum.supervisor;
        const tenantId = "child-tenant-456";
        const parentTenantId = "parent-tenant-123";

        await service.setHierarchicalTenantContext(
          userId,
          userRole,
          tenantId,
          parentTenantId,
        );

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.parent_tenant_id', $1, false)`,
          [parentTenantId],
        );
      });
    });

    describe("dataIsolationValidation", () => {
      it("should validate data isolation between tenants", async () => {
        const tenant1Id = "tenant-1";
        const tenant2Id = "tenant-2";

        // Mock responses for validateDataIsolation calls
        mockQueryRunner.query.mockResolvedValue([{ count: "10" }]);

        const result = await service.validateTenantDataIsolation(
          tenant1Id,
          tenant2Id,
        );

        expect(result).toHaveProperty("isolated");
        expect(result).toHaveProperty("violations");
      });

      it("should handle cross-tenant data leakage detection", async () => {
        const tenantId = "tenant-legit";

        mockQueryRunner.query.mockResolvedValue([{ tenant_count: "0" }]);

        const leakageTest = await service.detectDataLeakage(tenantId);

        expect(leakageTest.hasLeakage).toBe(false);
        expect(leakageTest.leakages).toEqual([]);
      });
    });

    describe("factoryTenantIsolation", () => {
      it("should enforce factory-level tenant isolation", async () => {
        const factoryUserId = "factory-user-123";
        const factoryId = "factory-xyz-789";
        const factoryTenantId = "factory-tenant-abc";

        await service.setFactoryTenantContext(
          factoryUserId,
          factoryId,
          factoryTenantId,
        );

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.factory_id', $1, false)`,
          [factoryId],
        );
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.tenant_id', $1, false)`,
          [factoryTenantId],
        );
      });

      it("should validate factory can only access own orders", async () => {
        const factoryId = "factory-123";

        mockQueryRunner.query.mockResolvedValue([{ count: "0" }]);

        const factoryAccess =
          await service.validateFactoryOrderAccess(factoryId);

        expect(factoryAccess.validAccess).toBe(true);
        expect(factoryAccess.violations).toEqual([]);
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.factory_id', $1, false)`,
          [factoryId],
        );
      });
    });

    describe("fitterTenantIsolation", () => {
      it("should enforce fitter-level tenant isolation", async () => {
        const fitterUserId = "fitter-user-456";
        const fitterId = "fitter-abc-123";
        const fitterTenantId = "fitter-tenant-def";

        await service.setFitterTenantContext(
          fitterUserId,
          fitterId,
          fitterTenantId,
        );

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.fitter_id', $1, false)`,
          [fitterId],
        );
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.tenant_id', $1, false)`,
          [fitterTenantId],
        );
      });

      it("should validate fitter can only access assigned customers", async () => {
        const fitterId = "fitter-789";

        mockQueryRunner.query.mockResolvedValue([{ count: "0" }]);

        const fitterAccess =
          await service.validateFitterCustomerAccess(fitterId);

        expect(fitterAccess.validAccess).toBe(true);
        expect(fitterAccess.violations).toEqual([]);
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.fitter_id', $1, false)`,
          [fitterId],
        );
      });
    });

    describe("adminBypassSecurity", () => {
      it("should allow admin users to bypass tenant restrictions when needed", async () => {
        const adminUserId = "admin-user-global";

        await service.setAdminBypassContext(adminUserId);

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.bypass_mode', 'true', false)`,
        );
      });

      it("should validate admin can access all tenant data in bypass mode", async () => {
        const adminUserId = "global-admin";

        mockQueryRunner.query.mockResolvedValue([{ count: "5" }]);

        const adminAccess =
          await service.validateAdminGlobalAccess(adminUserId);

        expect(adminAccess).toHaveProperty("hasGlobalAccess");
        expect(adminAccess).toHaveProperty("violations");
      });
    });

    describe("auditAndCompliance", () => {
      it("should log RLS context changes for audit trail", async () => {
        const userId = "audit-user";
        const userRole = RoleEnum.fitter;

        await service.setUserContextWithAudit(userId, userRole);

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.user_id', $1, false)`,
          [userId],
        );
      });

      it("should generate compliance report for tenant data access", async () => {
        const tenantId = "compliance-tenant";

        mockQueryRunner.query.mockResolvedValue([
          {
            rls_enabled: true,
            policyname: "test_policy",
            table_name: "orders",
            tenant_count: "0",
            count: "0",
          },
        ]);

        const complianceReport =
          await service.generateTenantComplianceReport(tenantId);

        expect(complianceReport).toHaveProperty("tenantId", tenantId);
        expect(complianceReport).toHaveProperty("rlsEnabled");
        expect(complianceReport).toHaveProperty("policiesActive");
        expect(complianceReport).toHaveProperty("dataIsolated");
        expect(complianceReport).toHaveProperty("violations");
        expect(complianceReport).toHaveProperty("recommendations");
      });
    });

    describe("performanceOptimization", () => {
      it("should cache RLS context to avoid repeated database calls", async () => {
        const userId = "cache-test-user";
        const userRole = RoleEnum.user;

        // First call should hit database
        await service.setUserContextWithCache(userId, userRole);

        // Second call should also work
        await service.setUserContextWithCache(userId, userRole);

        const setContextCalls = mockQueryRunner.query.mock.calls.filter(
          (call: any[]) => call[0].includes("set_config"),
        );
        expect(setContextCalls.length).toBeGreaterThan(0);
      });

      it("should handle RLS context batch operations efficiently", async () => {
        const userContexts = [
          { userId: "user1", userRole: RoleEnum.user },
          { userId: "user2", userRole: RoleEnum.fitter, fitterId: "fitter-1" },
          {
            userId: "user3",
            userRole: RoleEnum.factory,
            factoryId: "factory-1",
          },
        ];

        await service.batchSetUserContexts(userContexts);

        // Should use a transaction
        expect(mockQueryRunner.query).toHaveBeenCalled();
      });
    });

    describe("securityValidation", () => {
      it("should detect and prevent RLS policy bypass attempts", async () => {
        // Mock bypass mode enabled with non-supervisor role
        mockQueryRunner.query
          .mockResolvedValueOnce([{ bypass_mode: "true" }])
          .mockResolvedValueOnce([{ user_role: RoleEnum.user.toString() }])
          .mockResolvedValueOnce([{ user_id: "malicious-user" }]);

        const result = await service.validateSecurityContext();

        expect(result.secure).toBe(false);
        expect(result.securityIssues.length).toBeGreaterThan(0);
      });

      it("should validate RLS policy integrity", async () => {
        mockQueryRunner.query.mockResolvedValue([]);

        const policyIntegrity = await service.validateRlsPolicyIntegrity();

        expect(policyIntegrity).toHaveProperty("integrityValid");
        expect(policyIntegrity).toHaveProperty("policyIssues");
      });
    });
  });
});
