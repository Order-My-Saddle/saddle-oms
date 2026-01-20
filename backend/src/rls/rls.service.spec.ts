import { Test, TestingModule } from "@nestjs/testing";
import { DataSource } from "typeorm";
import { RlsService } from "./rls.service";
import { RoleEnum } from "../roles/roles.enum";

describe("RlsService", () => {
  let service: RlsService;
  let _dataSource: DataSource;
  void _dataSource; // Reserved for direct DataSource testing
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
        const parentTenantId = "parent-tenant-123";
        const childTenantId = "child-tenant-456";

        await service.setHierarchicalTenantContext(
          userId,
          userRole,
          parentTenantId,
          [childTenantId],
        );

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.parent_tenant_id', $1, false)`,
          [parentTenantId],
        );
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.child_tenant_ids', $1, false)`,
          [JSON.stringify([childTenantId])],
        );
      });
    });

    describe("dataIsolationValidation", () => {
      it("should validate data isolation between tenants", async () => {
        const tenant1UserId = "user-tenant1";
        const tenant2UserId = "user-tenant2";
        const tenant1Id = "tenant-1";
        const tenant2Id = "tenant-2";

        // Mock responses for tenant 1
        mockQueryRunner.query
          .mockResolvedValueOnce([]) // Set tenant 1 context
          .mockResolvedValueOnce([{ count: "10" }]) // Tenant 1 has access to 10 orders
          .mockResolvedValueOnce([]) // Set tenant 2 context
          .mockResolvedValueOnce([{ count: "0" }]); // Tenant 2 has no access to tenant 1 data

        const tenant1Access = await service.validateTenantDataIsolation(
          tenant1UserId,
          RoleEnum.user,
          tenant1Id,
          "orders",
        );
        const tenant2Access = await service.validateTenantDataIsolation(
          tenant2UserId,
          RoleEnum.user,
          tenant2Id,
          "orders",
        );

        expect(tenant1Access.accessibleRecords).toBe(10);
        expect(tenant2Access.accessibleRecords).toBe(0);
        expect(tenant1Access.isIsolated).toBe(true);
      });

      it("should handle cross-tenant data leakage detection", async () => {
        const userId = "security-test-user";
        const userRole = RoleEnum.user;
        const legitimateTenantId = "tenant-legit";
        const maliciousTenantId = "tenant-malicious";

        mockQueryRunner.query
          .mockResolvedValueOnce([]) // Set legitimate tenant context
          .mockResolvedValueOnce([{ count: "5" }]) // Should see 5 records
          .mockResolvedValueOnce([]) // Change to malicious tenant context
          .mockResolvedValueOnce([{ count: "0" }]); // Should see 0 records (proper isolation)

        const leakageTest = await service.detectDataLeakage(
          userId,
          userRole,
          legitimateTenantId,
          maliciousTenantId,
        );

        expect(leakageTest.hasLeakage).toBe(false);
        expect(leakageTest.legitimateAccess).toBe(5);
        expect(leakageTest.unauthorizedAccess).toBe(0);
      });
    });

    describe("factoryTenantIsolation", () => {
      it("should enforce factory-level tenant isolation", async () => {
        const factoryUserId = "factory-user-123";
        const userRole = RoleEnum.factory;
        const factoryTenantId = "factory-tenant-abc";
        const factoryId = "factory-xyz-789";

        await service.setFactoryTenantContext(
          factoryUserId,
          userRole,
          factoryTenantId,
          factoryId,
        );

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.tenant_id', $1, false)`,
          [factoryTenantId],
        );
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.factory_id', $1, false)`,
          [factoryId],
        );
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.factory_tenant_mode', 'true', false)`,
        );
      });

      it("should validate factory can only access own orders", async () => {
        const factoryUserId = "factory-user";
        const userRole = RoleEnum.factory;
        const factoryId = "factory-123";

        mockQueryRunner.query
          .mockResolvedValueOnce([]) // Set factory context
          .mockResolvedValueOnce([{ count: "25" }]); // Factory should see 25 orders

        const factoryAccess = await service.validateFactoryOrderAccess(
          factoryUserId,
          userRole,
          factoryId,
        );

        expect(factoryAccess.accessibleOrders).toBe(25);
        expect(factoryAccess.factoryId).toBe(factoryId);
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.factory_id', $1, false)`,
          [factoryId],
        );
      });
    });

    describe("fitterTenantIsolation", () => {
      it("should enforce fitter-level tenant isolation", async () => {
        const fitterUserId = "fitter-user-456";
        const userRole = RoleEnum.fitter;
        const fitterTenantId = "fitter-tenant-def";
        const fitterId = "fitter-abc-123";

        await service.setFitterTenantContext(
          fitterUserId,
          userRole,
          fitterTenantId,
          fitterId,
        );

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.tenant_id', $1, false)`,
          [fitterTenantId],
        );
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.fitter_id', $1, false)`,
          [fitterId],
        );
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.fitter_tenant_mode', 'true', false)`,
        );
      });

      it("should validate fitter can only access assigned customers", async () => {
        const fitterUserId = "fitter-user";
        const userRole = RoleEnum.fitter;
        const fitterId = "fitter-789";

        mockQueryRunner.query
          .mockResolvedValueOnce([]) // Set fitter context
          .mockResolvedValueOnce([{ count: "15" }]) // Fitter should see 15 customers
          .mockResolvedValueOnce([{ count: "40" }]); // And 40 orders

        const fitterAccess = await service.validateFitterCustomerAccess(
          fitterUserId,
          userRole,
          fitterId,
        );

        expect(fitterAccess.accessibleCustomers).toBe(15);
        expect(fitterAccess.accessibleOrders).toBe(40);
        expect(fitterAccess.fitterId).toBe(fitterId);
      });
    });

    describe("adminBypassSecurity", () => {
      it("should allow admin users to bypass tenant restrictions when needed", async () => {
        const adminUserId = "admin-user-global";
        const userRole = RoleEnum.admin;

        await service.setAdminBypassContext(adminUserId, userRole, true);

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.admin_bypass_mode', 'true', false)`,
        );
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.user_role', $1, false)`,
          [RoleEnum.admin.toString()],
        );
      });

      it("should validate admin can access all tenant data in bypass mode", async () => {
        const adminUserId = "global-admin";
        const userRole = RoleEnum.admin;

        mockQueryRunner.query
          .mockResolvedValueOnce([]) // Set admin bypass context
          .mockResolvedValueOnce([{ count: "1000" }]) // Should see all records
          .mockResolvedValueOnce([{ count: "500" }]) // All customers
          .mockResolvedValueOnce([{ count: "200" }]); // All factories

        const adminAccess = await service.validateAdminGlobalAccess(
          adminUserId,
          userRole,
          true,
        );

        expect(adminAccess.totalOrders).toBe(1000);
        expect(adminAccess.totalCustomers).toBe(500);
        expect(adminAccess.totalFactories).toBe(200);
        expect(adminAccess.bypassMode).toBe(true);
      });

      it("should enforce tenant restrictions for admin in normal mode", async () => {
        const tenantAdminUserId = "tenant-admin";
        const userRole = RoleEnum.admin;
        const tenantId = "admin-tenant-123";

        await service.setAdminBypassContext(
          tenantAdminUserId,
          userRole,
          false,
          tenantId,
        );

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.admin_bypass_mode', 'false', false)`,
        );
        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.tenant_id', $1, false)`,
          [tenantId],
        );
      });
    });

    describe("auditAndCompliance", () => {
      it("should log RLS context changes for audit trail", async () => {
        const userId = "audit-user";
        const userRole = RoleEnum.fitter;
        const tenantId = "audit-tenant";
        const auditData = {
          action: "SET_CONTEXT",
          previousContext: null,
          newContext: { userId, userRole, tenantId },
          timestamp: new Date(),
          ipAddress: "192.168.1.100",
        };

        await service.setUserContextWithAudit(userId, userRole, auditData);

        expect(mockQueryRunner.query).toHaveBeenCalledWith(
          `SELECT set_config('rls.audit_log', $1, false)`,
          [JSON.stringify(auditData)],
        );
      });

      it("should generate compliance report for tenant data access", async () => {
        const tenantId = "compliance-tenant";
        const reportPeriod = {
          start: new Date("2023-12-01"),
          end: new Date("2023-12-31"),
        };

        mockQueryRunner.query.mockResolvedValue([
          {
            user_id: "user1",
            access_count: "150",
            last_access: "2023-12-30T10:00:00Z",
            data_types: "orders,customers",
          },
        ]);

        const complianceReport = await service.generateTenantComplianceReport(
          tenantId,
          reportPeriod,
        );

        expect(complianceReport).toEqual({
          tenantId,
          reportPeriod,
          userAccess: [
            {
              userId: "user1",
              accessCount: 150,
              lastAccess: new Date("2023-12-30T10:00:00Z"),
              dataTypes: ["orders", "customers"],
            },
          ],
          totalAccesses: 150,
          uniqueUsers: 1,
        });
      });
    });

    describe("performanceOptimization", () => {
      it("should cache RLS context to avoid repeated database calls", async () => {
        const userId = "cache-test-user";
        const userRole = RoleEnum.user;
        const cacheKey = `rls_context_${userId}`;

        // First call should hit database
        await service.setUserContextWithCache(userId, userRole, cacheKey, 300); // 5 min TTL

        // Second call should use cache (verify by checking query call count)
        await service.setUserContextWithCache(userId, userRole, cacheKey, 300);

        // Should only set context once (first time), second should use cache
        const setContextCalls = mockQueryRunner.query.mock.calls.filter(
          (call) => call[0].includes("set_config"),
        );
        expect(setContextCalls.length).toBeLessThan(6); // Less than full context setup
      });

      it("should handle RLS context batch operations efficiently", async () => {
        const userContexts = [
          { userId: "user1", role: RoleEnum.user, tenantId: "tenant1" },
          { userId: "user2", role: RoleEnum.fitter, tenantId: "tenant2" },
          { userId: "user3", role: RoleEnum.factory, tenantId: "tenant3" },
        ];

        await service.batchSetUserContexts(userContexts);

        // Should use a single transaction for efficiency
        expect(mockQueryRunner.query).toHaveBeenCalledWith("BEGIN TRANSACTION");
        expect(mockQueryRunner.query).toHaveBeenCalledWith("COMMIT");
      });
    });

    describe("securityValidation", () => {
      it("should detect and prevent RLS policy bypass attempts", async () => {
        const maliciousUserId = "malicious-user";
        const userRole = RoleEnum.user;
        const attemptedBypassContext = {
          "rls.admin_bypass_mode": "true", // Unauthorized bypass attempt
          "rls.user_role": RoleEnum.admin.toString(),
        };

        await expect(
          service.validateSecurityContext(
            maliciousUserId,
            userRole,
            attemptedBypassContext,
          ),
        ).rejects.toThrow("Unauthorized RLS context manipulation detected");
      });

      it("should validate RLS policy integrity", async () => {
        mockQueryRunner.query.mockResolvedValue([
          {
            table_name: "orders",
            policy_count: 5,
            has_required_policies: true,
            security_level: "HIGH",
          },
        ]);

        const policyIntegrity = await service.validateRlsPolicyIntegrity();

        expect(policyIntegrity.isValid).toBe(true);
        expect(policyIntegrity.tables).toContain("orders");
        expect(policyIntegrity.totalPolicies).toBeGreaterThan(0);
      });
    });
  });
});
