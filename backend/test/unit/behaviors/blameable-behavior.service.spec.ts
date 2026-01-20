import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { EntityManager } from "typeorm";

import { BlameableBehavior } from "../../../src/behaviors/services/blameable-behavior.service";
import { BehaviorContext } from "../../../src/behaviors/interfaces";
import {
  getBlameableConfig,
  isBlameable,
} from "../../../src/behaviors/decorators";

// Mock the decorators
jest.mock("../../../src/behaviors/decorators", () => ({
  getBlameableConfig: jest.fn(),
  isBlameable: jest.fn(),
}));

// Define a type for entities that can have blameable properties added
type BlameableTestEntity = {
  [key: string]: any;
  name?: string;
  id?: number;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  blameHistory?: any[];
  userRelationships?: any[];
  authorId?: string;
  modifiedBy?: string;
};

describe("BlameableBehavior", () => {
  let behavior: BlameableBehavior;
  let mockEntityManager: jest.Mocked<EntityManager>;

  const mockGetBlameableConfig = getBlameableConfig as jest.MockedFunction<
    typeof getBlameableConfig
  >;
  const mockIsBlameable = isBlameable as jest.MockedFunction<
    typeof isBlameable
  >;

  const defaultConfig = {
    trackCreation: true,
    trackUpdates: true,
    trackDeletions: true,
    createdByField: "createdBy",
    updatedByField: "updatedBy",
    deletedByField: "deletedBy",
    keepHistory: true,
    historyField: "blameHistory",
    trackRelationships: false,
    relationshipField: "userRelationships",
    maxHistorySize: 100,
  };

  const mockContext: BehaviorContext = {
    userId: "user123",
    entityType: "User",
    operation: "create",
    isNewEntity: true,
    metadata: {
      timestamp: new Date("2023-01-01T10:00:00Z"),
    },
  };

  beforeEach(async () => {
    mockEntityManager = {
      query: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [BlameableBehavior],
    }).compile();

    behavior = module.get<BlameableBehavior>(BlameableBehavior);

    // Reset mocks
    mockGetBlameableConfig.mockReturnValue(defaultConfig);
    mockIsBlameable.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("beforeSave", () => {
    it("should set createdBy field for new entities", async () => {
      // Arrange
      const entity = { name: "Test User" } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext, operation: "create" };

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity).toEqual({
        name: "Test User",
        createdBy: "user123",
        updatedBy: "user123",
        blameHistory: expect.arrayContaining([
          expect.objectContaining({
            action: "create",
            userId: "user123",
            timestamp: expect.any(Date),
            changes: {},
            relatedEntities: [],
          }),
        ]),
      });
    });

    it("should not overwrite existing createdBy field", async () => {
      // Arrange
      const entity = {
        name: "Test User",
        createdBy: "original_user",
      } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext, operation: "create" };

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity.createdBy).toBe("original_user");
      expect(entity.updatedBy).toBe("user123");
    });

    it("should set updatedBy field for update operations", async () => {
      // Arrange
      const entity = {
        id: 1,
        name: "Updated User",
        createdBy: "original_user",
      } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext, operation: "update" };

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity.updatedBy).toBe("user123");
      expect(entity.createdBy).toBe("original_user");
    });

    it("should skip when entity is not blameable", async () => {
      // Arrange
      const entity = { name: "Test User" } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext };
      mockIsBlameable.mockReturnValue(false);

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity).toEqual({ name: "Test User" });
    });

    it("should skip when no userId in context", async () => {
      // Arrange
      const entity = { name: "Test User" } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext, userId: undefined };

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity).toEqual({ name: "Test User" });
    });

    it("should skip when no config available", async () => {
      // Arrange
      const entity = { name: "Test User" } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext };
      mockGetBlameableConfig.mockReturnValue(undefined);

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity).toEqual({ name: "Test User" });
    });

    it("should update blame history when keepHistory is enabled", async () => {
      // Arrange
      const entity = { name: "Test User" } as BlameableTestEntity;
      const context: BehaviorContext = {
        ...mockContext,
        metadata: {
          timestamp: new Date(),
          userRole: "admin",
          ipAddress: "192.168.1.1",
          sessionId: "session123",
          originalEntity: { name: "Old Name" },
        },
      };

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity.blameHistory).toBeDefined();
      expect(entity.blameHistory).toHaveLength(1);
      expect(entity.blameHistory![0]).toEqual(
        expect.objectContaining({
          userId: "user123",
          action: "create",
          userRole: "admin",
          ipAddress: "192.168.1.1",
          sessionId: "session123",
          timestamp: expect.any(Date),
          changes: expect.objectContaining({
            name: { from: "Old Name", to: "Test User" },
          }),
        }),
      );
    });

    it("should track user relationships when trackRelationships is enabled", async () => {
      // Arrange
      const config = {
        ...defaultConfig,
        trackRelationships: true,
      };
      mockGetBlameableConfig.mockReturnValue(config);

      const entity = { name: "Test User" } as BlameableTestEntity;
      const context: BehaviorContext = {
        ...mockContext,
        metadata: {
          timestamp: new Date("2023-01-01T10:00:00Z"),
          originalUserId: "admin123",
          relationshipType: "delegation",
          delegationReason: "Emergency support",
        },
      };

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity.userRelationships).toBeDefined();
      expect(entity.userRelationships).toHaveLength(1);
      expect(entity.userRelationships![0]).toEqual(
        expect.objectContaining({
          originalUserId: "admin123",
          actingUserId: "user123",
          relationshipType: "delegation",
          action: "create",
          reason: "Emergency support",
          timestamp: expect.any(Date),
        }),
      );
    });

    it("should limit history size according to maxHistorySize", async () => {
      // Arrange
      const config = { ...defaultConfig, maxHistorySize: 2 };
      mockGetBlameableConfig.mockReturnValue(config);

      const entity = {
        name: "Test User",
        blameHistory: [
          {
            userId: "old1",
            action: "create",
            timestamp: new Date(Date.now() - 3000),
          },
          {
            userId: "old2",
            action: "update",
            timestamp: new Date(Date.now() - 2000),
          },
          {
            userId: "old3",
            action: "update",
            timestamp: new Date(Date.now() - 1000),
          },
        ],
      };
      const context: BehaviorContext = { ...mockContext };

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity.blameHistory).toHaveLength(2);
      expect(entity.blameHistory![0].userId).toBe("old3");
      expect(entity.blameHistory![1].userId).toBe("user123");
    });

    it("should log debug information during processing", async () => {
      // Arrange
      const entity = { name: "Test User" } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext };
      const loggerSpy = jest
        .spyOn(Logger.prototype, "debug")
        .mockImplementation();

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith("Set createdBy for new User");
      expect(loggerSpy).toHaveBeenCalledWith("Set updatedBy for User");

      loggerSpy.mockRestore();
    });
  });

  describe("beforeDelete", () => {
    it("should set deletedBy field for delete operations", async () => {
      // Arrange
      const entity = { id: 1, name: "User to Delete" } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext, operation: "delete" };

      // Act
      await behavior.beforeDelete(entity, context);

      // Assert
      expect(entity.deletedBy).toBe("user123");
    });

    it("should update blame history for delete operations", async () => {
      // Arrange
      const entity = { id: 1, name: "User to Delete" } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext, operation: "delete" };

      // Act
      await behavior.beforeDelete(entity, context);

      // Assert
      expect(entity.blameHistory).toBeDefined();
      expect(entity.blameHistory![0].action).toBe("delete");
      expect(entity.blameHistory![0].userId).toBe("user123");
    });

    it("should skip when deletions are not tracked", async () => {
      // Arrange
      const config = { ...defaultConfig, trackDeletions: false };
      mockGetBlameableConfig.mockReturnValue(config);

      const entity = { id: 1, name: "User to Delete" } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext, operation: "delete" };

      // Act
      await behavior.beforeDelete(entity, context);

      // Assert
      expect(entity.deletedBy).toBeUndefined();
    });
  });

  describe("isApplicable", () => {
    it("should return true when entity is blameable and userId is present", () => {
      // Arrange
      const entityClass = class TestEntity {};
      const entity = {} as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext };

      mockIsBlameable.mockReturnValue(true);

      // Act
      const result = behavior.isApplicable(entityClass, entity, context);

      // Assert
      expect(result).toBe(true);
      expect(mockIsBlameable).toHaveBeenCalledWith(entityClass);
    });

    it("should return false when entity is not blameable", () => {
      // Arrange
      const entityClass = class TestEntity {};
      const entity = {} as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext };

      mockIsBlameable.mockReturnValue(false);

      // Act
      const result = behavior.isApplicable(entityClass, entity, context);

      // Assert
      expect(result).toBe(false);
    });

    it("should return false when no userId in context", () => {
      // Arrange
      const entityClass = class TestEntity {};
      const entity = {} as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext, userId: undefined };

      mockIsBlameable.mockReturnValue(true);

      // Act
      const result = behavior.isApplicable(entityClass, entity, context);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getUserInfo", () => {
    it("should return user information from database", async () => {
      // Arrange
      const context: BehaviorContext = {
        ...mockContext,
        entityManager: mockEntityManager,
      };

      mockEntityManager.query.mockResolvedValue([
        {
          id: "user123",
          email: "test@example.com",
          first_name: "John",
          last_name: "Doe",
          role: "Admin",
          department: "Administration",
        },
      ]);

      // Act
      const result = await behavior.getUserInfo("user123", context);

      // Assert
      expect(result).toEqual({
        id: "user123",
        name: "John Doe",
        email: "test@example.com",
        role: "Admin",
        department: "Administration",
      });
    });

    it("should return null when user not found", async () => {
      // Arrange
      const context: BehaviorContext = {
        ...mockContext,
        entityManager: mockEntityManager,
      };

      mockEntityManager.query.mockResolvedValue([]);

      // Act
      const result = await behavior.getUserInfo("unknown", context);

      // Assert
      expect(result).toBeNull();
    });

    it("should return null when no entity manager available", async () => {
      // Arrange
      const context: BehaviorContext = { ...mockContext };

      // Act
      const result = await behavior.getUserInfo("user123", context);

      // Assert
      expect(result).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      const context: BehaviorContext = {
        ...mockContext,
        entityManager: mockEntityManager,
      };

      mockEntityManager.query.mockRejectedValue(new Error("Database error"));
      const loggerSpy = jest
        .spyOn(Logger.prototype, "warn")
        .mockImplementation();

      // Act
      const result = await behavior.getUserInfo("user123", context);

      // Assert
      expect(result).toBeNull();
      expect(loggerSpy).toHaveBeenCalledWith(
        "Failed to get user info for user123: Database error",
      );

      loggerSpy.mockRestore();
    });
  });

  describe("generateBlameReport", () => {
    it("should generate comprehensive blame report", async () => {
      // Arrange
      const configWithRelationships = {
        ...defaultConfig,
        trackRelationships: true,
      };
      mockGetBlameableConfig.mockReturnValue(configWithRelationships);

      const entity = {
        createdBy: "user1",
        updatedBy: "user2",
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
        blameHistory: [
          {
            action: "create",
            userId: "user1",
            userName: "John Doe",
            timestamp: new Date("2023-01-01"),
            changes: { name: { from: null, to: "Test User" } },
          },
          {
            action: "update",
            userId: "user2",
            userName: "Jane Smith",
            timestamp: new Date("2023-01-02"),
            changes: { email: { from: "old@test.com", to: "new@test.com" } },
          },
        ],
        userRelationships: [
          {
            originalUserId: "admin1",
            actingUserId: "user2",
            relationshipType: "delegation",
            timestamp: new Date("2023-01-02"),
          },
        ],
      };

      // Act
      const report = await behavior.generateBlameReport(entity);

      // Assert
      expect(report.currentOwners).toHaveLength(2);
      expect(report.currentOwners[0]).toEqual({
        type: "creator",
        userId: "user1",
        since: entity.createdAt,
      });
      expect(report.currentOwners[1]).toEqual({
        type: "last_modifier",
        userId: "user2",
        since: entity.updatedAt,
      });

      expect(report.history).toHaveLength(2);
      expect(report.history[0]).toEqual({
        action: "create",
        userId: "user1",
        name: "John Doe",
        timestamp: entity.blameHistory![0].timestamp,
        changes: { name: { from: null, to: "Test User" } },
      });

      expect(report.relationships).toHaveLength(1);
      expect(report.relationships[0]).toEqual({
        originalUserId: "admin1",
        actingUserId: "user2",
        type: "delegation",
        timestamp: entity.userRelationships![0].timestamp,
      });
    });

    it("should handle entity without blame configuration", async () => {
      // Arrange
      const entity = { name: "Test Entity" } as BlameableTestEntity;
      mockGetBlameableConfig.mockReturnValue(undefined);

      // Act
      const report = await behavior.generateBlameReport(entity);

      // Assert
      expect(report).toEqual({
        currentOwners: [],
        history: [],
        relationships: [],
      });
    });

    it("should not duplicate creator and updater when they are the same", async () => {
      // Arrange
      const entity = {
        createdBy: "user1",
        updatedBy: "user1",
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-02"),
      };

      // Act
      const report = await behavior.generateBlameReport(entity);

      // Assert
      expect(report.currentOwners).toHaveLength(1);
      expect(report.currentOwners[0].type).toBe("creator");
    });
  });

  describe("private methods behavior", () => {
    describe("trackFieldChanges", () => {
      it("should track field changes correctly", async () => {
        // Arrange
        const entity = {
          name: "New Name",
          email: "new@test.com",
          id: 1,
        } as BlameableTestEntity;
        const context: BehaviorContext = {
          ...mockContext,
          metadata: {
            timestamp: new Date("2023-01-01T10:00:00Z"),
            originalEntity: { name: "Old Name", email: "old@test.com", id: 1 },
          },
        };

        // Act
        await behavior.beforeSave(entity, context);

        // Assert
        const historyEntry = entity.blameHistory![0];
        expect(historyEntry.changes).toEqual({
          name: { from: "Old Name", to: "New Name" },
          email: { from: "old@test.com", to: "new@test.com" },
        });
      });

      it("should exclude system fields from change tracking", async () => {
        // Arrange
        const entity = {
          name: "New Name",
          id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 2,
        } as BlameableTestEntity;
        const context: BehaviorContext = {
          ...mockContext,
          metadata: {
            timestamp: new Date("2023-01-01T10:00:00Z"),
            originalEntity: {
              name: "Old Name",
              id: 1,
              createdAt: new Date(Date.now() - 1000),
              updatedAt: new Date(Date.now() - 1000),
              version: 1,
            },
          },
        };

        // Act
        await behavior.beforeSave(entity, context);

        // Assert
        const historyEntry = entity.blameHistory![0];
        expect(historyEntry.changes).toEqual({
          name: { from: "Old Name", to: "New Name" },
        });
        expect(historyEntry.changes.id).toBeUndefined();
        expect(historyEntry.changes.version).toBeUndefined();
      });
    });

    describe("getRelatedEntityInfo", () => {
      it("should identify related entities", async () => {
        // Arrange
        const entity = {
          name: "Test Order",
          customerId: "customer123",
          fitterId: "fitter456",
          supplierId: "supplier789",
        } as BlameableTestEntity;
        const context: BehaviorContext = { ...mockContext };

        // Act
        await behavior.beforeSave(entity, context);

        // Assert
        const historyEntry = entity.blameHistory![0];
        expect(historyEntry.relatedEntities).toEqual([
          { type: "Customer", id: "customer123", relationship: "belongs_to" },
          { type: "Fitter", id: "fitter456", relationship: "belongs_to" },
          { type: "Supplier", id: "supplier789", relationship: "belongs_to" },
        ]);
      });
    });

    describe("trackUserRelationships", () => {
      it("should skip when no delegation scenario", async () => {
        // Arrange
        const config = { ...defaultConfig, trackRelationships: true };
        mockGetBlameableConfig.mockReturnValue(config);

        const entity = { name: "Test User" } as BlameableTestEntity;
        const context: BehaviorContext = {
          ...mockContext,
          metadata: {
            timestamp: new Date("2023-01-01T10:00:00Z"),
          }, // No originalUserId
        };

        // Act
        await behavior.beforeSave(entity, context);

        // Assert
        expect(entity.userRelationships).toBeUndefined();
      });

      it("should skip when original user is same as acting user", async () => {
        // Arrange
        const config = { ...defaultConfig, trackRelationships: true };
        mockGetBlameableConfig.mockReturnValue(config);

        const entity = { name: "Test User" } as BlameableTestEntity;
        const context: BehaviorContext = {
          ...mockContext,
          metadata: {
            timestamp: new Date("2023-01-01T10:00:00Z"),
            originalUserId: "user123", // Same as context.userId
          },
        };

        // Act
        await behavior.beforeSave(entity, context);

        // Assert
        expect(entity.userRelationships).toBeUndefined();
      });
    });
  });

  describe("behavior properties", () => {
    it("should have correct name, priority, and autoApply values", () => {
      // Assert
      expect(behavior.name).toBe("BlameableBehavior");
      expect(behavior.priority).toBe(20);
      expect(behavior.autoApply).toBe(true);
    });
  });

  describe("configuration variations", () => {
    it("should handle selective field tracking", async () => {
      // Arrange
      const config = {
        ...defaultConfig,
        trackCreation: false,
        trackUpdates: true,
        trackDeletions: false,
      };
      mockGetBlameableConfig.mockReturnValue(config);

      const entity = { name: "Test User" } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext, operation: "create" };

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity.createdBy).toBeUndefined();
      expect(entity.updatedBy).toBe("user123");
    });

    it("should handle custom field names", async () => {
      // Arrange
      const config = {
        ...defaultConfig,
        createdByField: "authorId",
        updatedByField: "modifiedBy",
        deletedByField: "removedBy",
      };
      mockGetBlameableConfig.mockReturnValue(config);

      const entity = { name: "Test User" } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext, operation: "create" };

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity.authorId).toBe("user123");
      expect(entity.modifiedBy).toBe("user123");
      expect(entity.createdBy).toBeUndefined();
      expect(entity.updatedBy).toBeUndefined();
    });

    it("should handle disabled history tracking", async () => {
      // Arrange
      const config = { ...defaultConfig, keepHistory: false };
      mockGetBlameableConfig.mockReturnValue(config);

      const entity = { name: "Test User" } as BlameableTestEntity;
      const context: BehaviorContext = { ...mockContext };

      // Act
      await behavior.beforeSave(entity, context);

      // Assert
      expect(entity.blameHistory).toBeUndefined();
      expect(entity.createdBy).toBe("user123");
      expect(entity.updatedBy).toBe("user123");
    });
  });
});
