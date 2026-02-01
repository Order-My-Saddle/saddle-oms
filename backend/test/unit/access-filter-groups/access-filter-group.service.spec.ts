import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { AccessFilterGroupService } from "../../../src/access-filter-groups/access-filter-group.service";
import { AccessFilterGroupRepository } from "../../../src/access-filter-groups/infrastructure/persistence/relational/repositories/access-filter-group.repository";
import { CreateAccessFilterGroupDto } from "../../../src/access-filter-groups/dto/create-access-filter-group.dto";
import { UpdateAccessFilterGroupDto } from "../../../src/access-filter-groups/dto/update-access-filter-group.dto";
import { QueryAccessFilterGroupDto } from "../../../src/access-filter-groups/dto/query-access-filter-group.dto";
import { AccessFilterGroupEntity } from "../../../src/access-filter-groups/infrastructure/persistence/relational/entities/access-filter-group.entity";

describe("AccessFilterGroupService", () => {
  let service: AccessFilterGroupService;
  let repository: jest.Mocked<AccessFilterGroupRepository>;

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
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      count: jest.fn(),
      restore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessFilterGroupService,
        {
          provide: AccessFilterGroupRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AccessFilterGroupService>(AccessFilterGroupService);
    repository = module.get(AccessFilterGroupRepository);
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

      repository.create.mockResolvedValue(mockAccessFilterGroupEntity);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockAccessFilterGroupEntity);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Regional Sales Team",
          description: "Filter for regional sales team",
          isActive: true,
        }),
      );
    });

    it("should create with default values", async () => {
      // Arrange
      const createDto: CreateAccessFilterGroupDto = {
        name: "Basic Group",
      };

      const entityWithDefaults = {
        ...mockAccessFilterGroupEntity,
        name: "Basic Group",
        description: null,
        filters: null,
        userIds: null,
        isActive: true,
      };

      repository.create.mockResolvedValue(
        entityWithDefaults as AccessFilterGroupEntity,
      );

      // Act
      await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Basic Group",
          description: null,
          filters: null,
          userIds: null,
          isActive: true,
        }),
      );
    });

    it("should handle isActive false explicitly", async () => {
      // Arrange
      const createDto: CreateAccessFilterGroupDto = {
        name: "Inactive Group",
        isActive: false,
      };

      repository.create.mockResolvedValue(mockAccessFilterGroupEntity);

      // Act
      await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        }),
      );
    });
  });

  describe("findAll", () => {
    it("should return all access filter groups with filters", async () => {
      // Arrange
      const queryDto = new QueryAccessFilterGroupDto();
      queryDto.filters = {
        name: "Regional",
        isActive: true,
      };

      repository.findAll.mockResolvedValue([mockAccessFilterGroupEntity]);

      // Act
      const result = await service.findAll(queryDto);

      // Assert
      expect(result).toEqual([mockAccessFilterGroupEntity]);
      expect(repository.findAll).toHaveBeenCalledWith({
        name: "Regional",
        isActive: true,
      });
    });

    it("should call getAccessFilterGroupFilters from queryDto", async () => {
      // Arrange
      const queryDto = new QueryAccessFilterGroupDto();
      const getFiltersSpy = jest.spyOn(queryDto, "getAccessFilterGroupFilters");

      repository.findAll.mockResolvedValue([mockAccessFilterGroupEntity]);

      // Act
      await service.findAll(queryDto);

      // Assert
      expect(getFiltersSpy).toHaveBeenCalled();
    });

    it("should handle empty filters", async () => {
      // Arrange
      const queryDto = new QueryAccessFilterGroupDto();

      repository.findAll.mockResolvedValue([mockAccessFilterGroupEntity]);

      // Act
      const result = await service.findAll(queryDto);

      // Assert
      expect(result).toEqual([mockAccessFilterGroupEntity]);
      expect(repository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({}),
      );
    });
  });

  describe("findOne", () => {
    it("should find access filter group by ID", async () => {
      // Arrange
      const id = 1;
      repository.findById.mockResolvedValue(mockAccessFilterGroupEntity);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(result).toEqual(mockAccessFilterGroupEntity);
      expect(repository.findById).toHaveBeenCalledWith(id);
    });

    it("should throw NotFoundException when group not found", async () => {
      // Arrange
      const id = 999;
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(id);
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

      const updatedEntity = {
        ...mockAccessFilterGroupEntity,
        name: "Updated Group Name",
        description: "Updated description",
        isActive: false,
      };

      repository.findById.mockResolvedValue(mockAccessFilterGroupEntity);
      repository.update.mockResolvedValue(
        updatedEntity as AccessFilterGroupEntity,
      );

      // Act
      const result = await service.update(id, updateDto);

      // Assert
      expect(result).toEqual(updatedEntity);
      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(repository.update).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          name: "Updated Group Name",
          description: "Updated description",
          isActive: false,
        }),
      );
    });

    it("should update partial fields", async () => {
      // Arrange
      const id = 1;
      const updateDto: UpdateAccessFilterGroupDto = {
        name: "New Name",
      };

      repository.findById.mockResolvedValue(mockAccessFilterGroupEntity);
      repository.update.mockResolvedValue(mockAccessFilterGroupEntity);

      // Act
      await service.update(id, updateDto);

      // Assert
      expect(repository.update).toHaveBeenCalledWith(
        id,
        expect.objectContaining({
          name: "New Name",
        }),
      );
    });

    it("should throw NotFoundException when group not found", async () => {
      // Arrange
      const id = 999;
      const updateDto: UpdateAccessFilterGroupDto = { name: "New Name" };
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when update fails", async () => {
      // Arrange
      const id = 1;
      const updateDto: UpdateAccessFilterGroupDto = { name: "New Name" };
      repository.findById.mockResolvedValue(mockAccessFilterGroupEntity);
      repository.update.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should soft delete access filter group successfully", async () => {
      // Arrange
      const id = 1;
      repository.findById.mockResolvedValue(mockAccessFilterGroupEntity);
      repository.softDelete.mockResolvedValue(undefined);

      // Act
      await service.remove(id);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(repository.softDelete).toHaveBeenCalledWith(id);
    });

    it("should throw NotFoundException when group not found", async () => {
      // Arrange
      const id = 999;
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe("countActive", () => {
    it("should count active access filter groups", async () => {
      // Arrange
      repository.count.mockResolvedValue(5);

      // Act
      const result = await service.countActive();

      // Assert
      expect(result).toBe(5);
      expect(repository.count).toHaveBeenCalledWith({ isActive: true });
    });

    it("should return 0 when no active groups", async () => {
      // Arrange
      repository.count.mockResolvedValue(0);

      // Act
      const result = await service.countActive();

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("restore", () => {
    it("should restore soft-deleted access filter group successfully", async () => {
      // Arrange
      const id = 1;
      repository.findById
        .mockResolvedValueOnce(mockAccessFilterGroupEntity) // First call for check
        .mockResolvedValueOnce(mockAccessFilterGroupEntity); // Second call after restore
      repository.restore.mockResolvedValue(undefined);

      // Act
      const result = await service.restore(id);

      // Assert
      expect(result).toEqual(mockAccessFilterGroupEntity);
      expect(repository.findById).toHaveBeenCalledWith(id);
      expect(repository.restore).toHaveBeenCalledWith(id);
      expect(repository.findById).toHaveBeenCalledTimes(2);
    });

    it("should throw NotFoundException when group not found", async () => {
      // Arrange
      const id = 999;
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.restore(id)).rejects.toThrow(NotFoundException);
      expect(repository.restore).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException when restore fails", async () => {
      // Arrange
      const id = 1;
      repository.findById
        .mockResolvedValueOnce(mockAccessFilterGroupEntity)
        .mockResolvedValueOnce(null);
      repository.restore.mockResolvedValue(undefined);

      // Act & Assert
      await expect(service.restore(id)).rejects.toThrow(NotFoundException);
    });
  });
});
