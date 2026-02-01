import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { AccessFilterGroupController } from "../../../src/access-filter-groups/access-filter-group.controller";
import { AccessFilterGroupService } from "../../../src/access-filter-groups/access-filter-group.service";
import { CreateAccessFilterGroupDto } from "../../../src/access-filter-groups/dto/create-access-filter-group.dto";
import { UpdateAccessFilterGroupDto } from "../../../src/access-filter-groups/dto/update-access-filter-group.dto";
import { QueryAccessFilterGroupDto } from "../../../src/access-filter-groups/dto/query-access-filter-group.dto";
import { AccessFilterGroupEntity } from "../../../src/access-filter-groups/infrastructure/persistence/relational/entities/access-filter-group.entity";

describe("AccessFilterGroupController", () => {
  let controller: AccessFilterGroupController;
  let service: jest.Mocked<AccessFilterGroupService>;

  const mockAccessFilterGroupEntity: AccessFilterGroupEntity = {
    id: 1,
    name: "Regional Sales Team",
    description: "Filter for regional sales team",
    filters: { region: "north" } as Record<string, any>,
    userIds: [1, 2, 3],
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: null,
  } as AccessFilterGroupEntity;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      countActive: jest.fn(),
      restore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessFilterGroupController],
      providers: [{ provide: AccessFilterGroupService, useValue: mockService }],
    }).compile();

    controller = module.get<AccessFilterGroupController>(
      AccessFilterGroupController,
    );
    service = module.get(AccessFilterGroupService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new access filter group successfully", async () => {
      // Arrange
      const createDto: CreateAccessFilterGroupDto = {
        name: "Regional Sales Team",
        description: "Filter for regional sales team",
        filters: { region: "north" } as Record<string, any>,
        userIds: [1, 2, 3],
        isActive: true,
      };
      service.create.mockResolvedValue(mockAccessFilterGroupEntity);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockAccessFilterGroupEntity);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("findAll", () => {
    it("should return all access filter groups with query filters", async () => {
      // Arrange
      const queryDto = new QueryAccessFilterGroupDto();
      queryDto.filters = {
        name: "Regional",
        isActive: true,
      };
      const groups = [mockAccessFilterGroupEntity];
      service.findAll.mockResolvedValue(groups);

      // Act
      const result = await controller.findAll(queryDto);

      // Assert
      expect(result).toEqual(groups);
      expect(service.findAll).toHaveBeenCalledWith(queryDto);
    });

    it("should return all groups without filters", async () => {
      // Arrange
      const queryDto = new QueryAccessFilterGroupDto();
      const groups = [mockAccessFilterGroupEntity];
      service.findAll.mockResolvedValue(groups);

      // Act
      const result = await controller.findAll(queryDto);

      // Assert
      expect(result).toEqual(groups);
      expect(service.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe("findOne", () => {
    it("should return access filter group by ID", async () => {
      // Arrange
      const id = 1;
      service.findOne.mockResolvedValue(mockAccessFilterGroupEntity);

      // Act
      const result = await controller.findOne(id);

      // Assert
      expect(result).toEqual(mockAccessFilterGroupEntity);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it("should handle group not found", async () => {
      // Arrange
      const id = 999;
      service.findOne.mockRejectedValue(
        new NotFoundException('Access filter group with ID "999" not found'),
      );

      // Act & Assert
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update access filter group successfully", async () => {
      // Arrange
      const id = 1;
      const updateDto: UpdateAccessFilterGroupDto = {
        name: "Updated Group Name",
        description: "Updated description",
        isActive: false,
      };
      const updatedGroup = { ...mockAccessFilterGroupEntity, ...updateDto };
      service.update.mockResolvedValue(updatedGroup as AccessFilterGroupEntity);

      // Act
      const result = await controller.update(id, updateDto);

      // Assert
      expect(result).toEqual(updatedGroup);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });

    it("should handle group not found during update", async () => {
      // Arrange
      const id = 999;
      const updateDto: UpdateAccessFilterGroupDto = { name: "New Name" };
      service.update.mockRejectedValue(
        new NotFoundException('Access filter group with ID "999" not found'),
      );

      // Act & Assert
      await expect(controller.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should remove access filter group successfully", async () => {
      // Arrange
      const id = 1;
      service.remove.mockResolvedValue();

      // Act
      await controller.remove(id);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(id);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it("should handle group not found during removal", async () => {
      // Arrange
      const id = 999;
      service.remove.mockRejectedValue(
        new NotFoundException('Access filter group with ID "999" not found'),
      );

      // Act & Assert
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("countActive", () => {
    it("should return count of active access filter groups", async () => {
      // Arrange
      service.countActive.mockResolvedValue(5);

      // Act
      const result = await controller.countActive();

      // Assert
      expect(result).toEqual({ count: 5 });
      expect(service.countActive).toHaveBeenCalledTimes(1);
    });

    it("should return 0 when no active groups", async () => {
      // Arrange
      service.countActive.mockResolvedValue(0);

      // Act
      const result = await controller.countActive();

      // Assert
      expect(result).toEqual({ count: 0 });
    });
  });

  describe("restore", () => {
    it("should restore soft-deleted access filter group successfully", async () => {
      // Arrange
      const id = 1;
      service.restore.mockResolvedValue(mockAccessFilterGroupEntity);

      // Act
      const result = await controller.restore(id);

      // Assert
      expect(result).toEqual(mockAccessFilterGroupEntity);
      expect(service.restore).toHaveBeenCalledWith(id);
      expect(service.restore).toHaveBeenCalledTimes(1);
    });

    it("should handle group not found during restore", async () => {
      // Arrange
      const id = 999;
      service.restore.mockRejectedValue(
        new NotFoundException('Access filter group with ID "999" not found'),
      );

      // Act & Assert
      await expect(controller.restore(id)).rejects.toThrow(NotFoundException);
    });
  });
});
