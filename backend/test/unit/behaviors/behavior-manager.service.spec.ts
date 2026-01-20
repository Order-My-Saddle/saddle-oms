import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

import { BehaviorManager } from "../../../src/behaviors/services/behavior-manager.service";
import { BlameableBehavior } from "../../../src/behaviors/services/blameable-behavior.service";
import { TimestampableBehavior } from "../../../src/behaviors/services/timestampable-behavior.service";
import { SoftDeletableBehavior } from "../../../src/behaviors/services/soft-deletable-behavior.service";
import { VersionableBehavior } from "../../../src/behaviors/services/versionable-behavior.service";
import { BehaviorContext } from "../../../src/behaviors/interfaces";

describe("BehaviorManager", () => {
  let manager: BehaviorManager;
  let blameableBehavior: jest.Mocked<BlameableBehavior>;
  let timestampableBehavior: jest.Mocked<TimestampableBehavior>;
  let softDeletableBehavior: jest.Mocked<SoftDeletableBehavior>;
  let versionableBehavior: jest.Mocked<VersionableBehavior>;

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
    const mockBlameableBehavior = {
      beforeSave: jest.fn(),
      afterSave: jest.fn(),
      beforeDelete: jest.fn(),
      afterDelete: jest.fn(),
      onLoad: jest.fn(),
      isApplicable: jest.fn().mockReturnValue(true),
      name: "BlameableBehavior",
      priority: 50,
    };

    const mockTimestampableBehavior = {
      beforeSave: jest.fn(),
      afterSave: jest.fn(),
      beforeDelete: jest.fn(),
      afterDelete: jest.fn(),
      onLoad: jest.fn(),
      isApplicable: jest.fn().mockReturnValue(true),
      name: "TimestampableBehavior",
      priority: 10,
    };

    const mockSoftDeletableBehavior = {
      beforeSave: jest.fn(),
      afterSave: jest.fn(),
      beforeDelete: jest.fn(),
      afterDelete: jest.fn(),
      onLoad: jest.fn(),
      isApplicable: jest.fn().mockReturnValue(true),
      name: "SoftDeletableBehavior",
      priority: 100,
    };

    const mockVersionableBehavior = {
      beforeSave: jest.fn(),
      afterSave: jest.fn(),
      beforeDelete: jest.fn(),
      afterDelete: jest.fn(),
      onLoad: jest.fn(),
      isApplicable: jest.fn().mockReturnValue(true),
      name: "VersionableBehavior",
      priority: 75,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BehaviorManager,
        { provide: BlameableBehavior, useValue: mockBlameableBehavior },
        { provide: TimestampableBehavior, useValue: mockTimestampableBehavior },
        { provide: SoftDeletableBehavior, useValue: mockSoftDeletableBehavior },
        { provide: VersionableBehavior, useValue: mockVersionableBehavior },
      ],
    }).compile();

    manager = module.get<BehaviorManager>(BehaviorManager);
    blameableBehavior = module.get(BlameableBehavior);
    timestampableBehavior = module.get(TimestampableBehavior);
    softDeletableBehavior = module.get(SoftDeletableBehavior);
    versionableBehavior = module.get(VersionableBehavior);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("should register all default behaviors", () => {
      // Assert
      const stats = manager.getBehaviorStats();
      expect(stats.beforeSave).toBeGreaterThan(0);
      expect(stats.afterSave).toBeGreaterThan(0);
      expect(stats.beforeDelete).toBeGreaterThan(0);
      expect(stats.afterDelete).toBeGreaterThan(0);
      expect(stats.onLoad).toBeGreaterThan(0);
    });
  });

  describe("applyBeforeSaveBehaviors", () => {
    it("should apply all applicable before save behaviors in priority order", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };

      // Act
      await manager.applyBeforeSaveBehaviors(entity, context);

      // Assert
      expect(timestampableBehavior.beforeSave).toHaveBeenCalledWith(
        entity,
        context,
      );
      expect(blameableBehavior.beforeSave).toHaveBeenCalledWith(
        entity,
        context,
      );
      expect(versionableBehavior.beforeSave).toHaveBeenCalledWith(
        entity,
        context,
      );

      // Verify order by checking call order (timestampable has priority 10, blameable 50, versionable 75)
      const timestampOrder =
        timestampableBehavior.beforeSave.mock.invocationCallOrder[0];
      const blameableOrder =
        blameableBehavior.beforeSave.mock.invocationCallOrder[0];
      const versionableOrder =
        versionableBehavior.beforeSave.mock.invocationCallOrder[0];

      expect(timestampOrder).toBeLessThan(blameableOrder);
      expect(blameableOrder).toBeLessThan(versionableOrder);
    });

    it("should skip non-applicable behaviors", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };

      timestampableBehavior.isApplicable.mockReturnValue(false);
      blameableBehavior.isApplicable.mockReturnValue(true);

      // Act
      await manager.applyBeforeSaveBehaviors(entity, context);

      // Assert
      expect(timestampableBehavior.beforeSave).not.toHaveBeenCalled();
      expect(blameableBehavior.beforeSave).toHaveBeenCalledWith(
        entity,
        context,
      );
    });

    it("should handle behavior errors and re-throw", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };
      const error = new Error("Behavior failed");

      timestampableBehavior.beforeSave.mockRejectedValue(error);

      // Act & Assert
      await expect(
        manager.applyBeforeSaveBehaviors(entity, context),
      ).rejects.toThrow("Behavior failed");
    });

    it("should log behavior application in debug mode", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };

      const loggerSpy = jest
        .spyOn(Logger.prototype, "debug")
        .mockImplementation();

      // Act
      await manager.applyBeforeSaveBehaviors(entity, context);

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Applied TimestampableBehavior beforeSave to User",
        ),
      );

      loggerSpy.mockRestore();
    });
  });

  describe("applyAfterSaveBehaviors", () => {
    it("should apply all applicable after save behaviors", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };

      // Act
      await manager.applyAfterSaveBehaviors(entity, context);

      // Assert
      expect(timestampableBehavior.afterSave).toHaveBeenCalledWith(
        entity,
        context,
      );
    });

    it("should continue execution even if a behavior fails", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };
      const error = new Error("After save behavior failed");

      timestampableBehavior.afterSave.mockRejectedValue(error);
      const loggerSpy = jest
        .spyOn(Logger.prototype, "warn")
        .mockImplementation();

      // Act
      await manager.applyAfterSaveBehaviors(entity, context);

      // Assert - Should not throw, but should log warning
      expect(loggerSpy).toHaveBeenCalledWith(
        "Continuing despite TimestampableBehavior failure",
      );

      loggerSpy.mockRestore();
    });
  });

  describe("applyBeforeDeleteBehaviors", () => {
    it("should apply all applicable before delete behaviors", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext, operation: "delete" };

      // Act
      await manager.applyBeforeDeleteBehaviors(entity, context);

      // Assert
      expect(softDeletableBehavior.beforeDelete).toHaveBeenCalledWith(
        entity,
        context,
      );
      expect(timestampableBehavior.beforeDelete).toHaveBeenCalledWith(
        entity,
        context,
      );
      expect(blameableBehavior.beforeDelete).toHaveBeenCalledWith(
        entity,
        context,
      );
    });

    it("should handle behavior errors and re-throw", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext, operation: "delete" };
      const error = new Error("Before delete failed");

      softDeletableBehavior.beforeDelete.mockRejectedValue(error);

      // Act & Assert
      await expect(
        manager.applyBeforeDeleteBehaviors(entity, context),
      ).rejects.toThrow("Before delete failed");
    });
  });

  describe("applyAfterDeleteBehaviors", () => {
    it("should apply all applicable after delete behaviors", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext, operation: "delete" };

      // Act
      await manager.applyAfterDeleteBehaviors(entity, context);

      // Assert
      expect(softDeletableBehavior.afterDelete).toHaveBeenCalledWith(
        entity,
        context,
      );
    });

    it("should continue execution even if a behavior fails", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext, operation: "delete" };
      const error = new Error("After delete behavior failed");

      softDeletableBehavior.afterDelete.mockRejectedValue(error);
      const loggerSpy = jest
        .spyOn(Logger.prototype, "warn")
        .mockImplementation();

      // Act
      await manager.applyAfterDeleteBehaviors(entity, context);

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        "Continuing despite SoftDeletableBehavior failure",
      );

      loggerSpy.mockRestore();
    });
  });

  describe("applyOnLoadBehaviors", () => {
    it("should apply all applicable on load behaviors", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext, operation: "load" };

      // Act
      await manager.applyOnLoadBehaviors(entity, context);

      // Assert
      expect(timestampableBehavior.onLoad).toHaveBeenCalledWith(
        entity,
        context,
      );
    });

    it("should continue execution even if a behavior fails", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext, operation: "load" };
      const error = new Error("On load behavior failed");

      timestampableBehavior.onLoad.mockRejectedValue(error);
      const loggerSpy = jest
        .spyOn(Logger.prototype, "warn")
        .mockImplementation();

      // Act
      await manager.applyOnLoadBehaviors(entity, context);

      // Assert
      expect(loggerSpy).toHaveBeenCalledWith(
        "Continuing despite TimestampableBehavior failure",
      );

      loggerSpy.mockRestore();
    });
  });

  describe("behavior registration", () => {
    it("should allow registering custom before save behaviors", () => {
      // Arrange
      const customBehavior = {
        beforeSave: jest.fn(),
        isApplicable: jest.fn().mockReturnValue(true),
        name: "CustomBehavior",
        priority: 25,
      };

      // Act
      manager.registerBeforeSaveBehavior(customBehavior);

      // Assert
      const stats = manager.getBehaviorStats();
      expect(stats.beforeSave).toBeGreaterThan(3); // Original 3 + custom
    });

    it("should allow registering custom after save behaviors", () => {
      // Arrange
      const customBehavior = {
        afterSave: jest.fn(),
        isApplicable: jest.fn().mockReturnValue(true),
        name: "CustomAfterSaveBehavior",
        priority: 25,
      };

      // Act
      manager.registerAfterSaveBehavior(customBehavior);

      // Assert
      const stats = manager.getBehaviorStats();
      expect(stats.afterSave).toBeGreaterThan(1); // Original 1 + custom
    });

    it("should sort behaviors by priority after registration", async () => {
      // Arrange
      const highPriorityBehavior = {
        beforeSave: jest.fn(),
        isApplicable: jest.fn().mockReturnValue(true),
        name: "HighPriorityBehavior",
        priority: 1,
      };

      const lowPriorityBehavior = {
        beforeSave: jest.fn(),
        isApplicable: jest.fn().mockReturnValue(true),
        name: "LowPriorityBehavior",
        priority: 999,
      };

      // Act
      manager.registerBeforeSaveBehavior(lowPriorityBehavior);
      manager.registerBeforeSaveBehavior(highPriorityBehavior);

      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };

      await manager.applyBeforeSaveBehaviors(entity, context);

      // Assert - High priority (lower number) should be called before low priority
      const highPriorityOrder =
        highPriorityBehavior.beforeSave.mock.invocationCallOrder[0];
      const timestampOrder =
        timestampableBehavior.beforeSave.mock.invocationCallOrder[0];
      const lowPriorityOrder =
        lowPriorityBehavior.beforeSave.mock.invocationCallOrder[0];

      expect(highPriorityOrder).toBeLessThan(timestampOrder);
      expect(lowPriorityOrder).toBeGreaterThan(timestampOrder);
    });
  });

  describe("behavior applicability", () => {
    it("should skip behaviors with autoApply set to false", async () => {
      // Arrange
      const nonApplicableBehavior = {
        beforeSave: jest.fn(),
        autoApply: false,
        name: "NonApplicableBehavior",
        priority: 50,
      };

      manager.registerBeforeSaveBehavior(nonApplicableBehavior);

      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };

      // Act
      await manager.applyBeforeSaveBehaviors(entity, context);

      // Assert
      expect(nonApplicableBehavior.beforeSave).not.toHaveBeenCalled();
    });

    it("should use behavior isApplicable method when available", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };

      timestampableBehavior.isApplicable.mockReturnValue(false);

      // Act
      await manager.applyBeforeSaveBehaviors(entity, context);

      // Assert
      expect(timestampableBehavior.isApplicable).toHaveBeenCalledWith(
        entity.constructor,
        entity,
        context,
      );
      expect(timestampableBehavior.beforeSave).not.toHaveBeenCalled();
    });

    it("should apply behaviors when isApplicable method is not available", async () => {
      // Arrange
      const behaviorWithoutApplicable = {
        beforeSave: jest.fn(),
        name: "SimpleBehavior",
        priority: 50,
      };

      manager.registerBeforeSaveBehavior(behaviorWithoutApplicable);

      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };

      // Act
      await manager.applyBeforeSaveBehaviors(entity, context);

      // Assert
      expect(behaviorWithoutApplicable.beforeSave).toHaveBeenCalledWith(
        entity,
        context,
      );
    });
  });

  describe("getBehaviorStats", () => {
    it("should return correct behavior counts", () => {
      // Act
      const stats = manager.getBehaviorStats();

      // Assert
      expect(stats).toEqual({
        beforeSave: expect.any(Number),
        afterSave: expect.any(Number),
        beforeDelete: expect.any(Number),
        afterDelete: expect.any(Number),
        onLoad: expect.any(Number),
      });

      expect(stats.beforeSave).toBeGreaterThan(0);
      expect(stats.afterSave).toBeGreaterThan(0);
      expect(stats.beforeDelete).toBeGreaterThan(0);
      expect(stats.afterDelete).toBeGreaterThan(0);
      expect(stats.onLoad).toBeGreaterThan(0);
    });

    it("should update counts when behaviors are added", () => {
      // Arrange
      const initialStats = manager.getBehaviorStats();

      const customBehavior = {
        beforeSave: jest.fn(),
        name: "CustomBehavior",
        priority: 50,
      };

      // Act
      manager.registerBeforeSaveBehavior(customBehavior);
      const updatedStats = manager.getBehaviorStats();

      // Assert
      expect(updatedStats.beforeSave).toBe(initialStats.beforeSave + 1);
    });
  });

  describe("error handling and logging", () => {
    it("should log errors with appropriate context", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };
      const error = new Error("Detailed behavior error");

      timestampableBehavior.beforeSave.mockRejectedValue(error);
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, "error")
        .mockImplementation();

      // Act & Assert
      await expect(
        manager.applyBeforeSaveBehaviors(entity, context),
      ).rejects.toThrow(error);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        "Failed to apply TimestampableBehavior beforeSave",
        error,
      );

      loggerErrorSpy.mockRestore();
    });

    it("should provide different error handling for different behavior phases", async () => {
      // Arrange
      const entity = { id: 1, name: "Test Entity" };
      const context: BehaviorContext = { ...mockContext };
      const error = new Error("Phase-specific error");

      timestampableBehavior.afterSave.mockRejectedValue(error);
      const loggerWarnSpy = jest
        .spyOn(Logger.prototype, "warn")
        .mockImplementation();

      // Act
      await manager.applyAfterSaveBehaviors(entity, context);

      // Assert - After save behaviors should not throw but should warn
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        "Continuing despite TimestampableBehavior failure",
      );

      loggerWarnSpy.mockRestore();
    });
  });
});
