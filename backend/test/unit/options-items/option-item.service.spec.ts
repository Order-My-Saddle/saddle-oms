import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { OptionItemService } from "../../../src/options-items/option-item.service";
import { OptionItemEntity } from "../../../src/options-items/infrastructure/persistence/relational/entities/option-item.entity";
import { CreateOptionItemDto } from "../../../src/options-items/dto/create-option-item.dto";
import { UpdateOptionItemDto } from "../../../src/options-items/dto/update-option-item.dto";

describe("OptionItemService", () => {
  let service: OptionItemService;
  let repository: jest.Mocked<Repository<OptionItemEntity>>;

  const mockOptionItemEntity: OptionItemEntity = {
    id: 1,
    optionId: 10,
    leatherId: 5,
    name: "Premium Leather Color",
    userColor: 1,
    userLeather: 1,
    price1: 100,
    price2: 110,
    price3: 120,
    price4: 130,
    price5: 140,
    price6: 150,
    price7: 160,
    sequence: 1,
    restrict: "none",
    deleted: 0,
  } as OptionItemEntity;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OptionItemService,
        {
          provide: getRepositoryToken(OptionItemEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<OptionItemService>(OptionItemService);
    repository = module.get(getRepositoryToken(OptionItemEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new option item successfully", async () => {
      // Arrange
      const createDto: CreateOptionItemDto = {
        optionId: 10,
        leatherId: 5,
        name: "Premium Leather Color",
        userColor: 1,
        userLeather: 1,
        price1: 100,
        price2: 110,
        price3: 120,
        price4: 130,
        price5: 140,
        price6: 150,
        price7: 160,
        sequence: 1,
        restrict: "none",
      };

      repository.create.mockReturnValue(mockOptionItemEntity);
      repository.save.mockResolvedValue(mockOptionItemEntity);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toMatchObject({
        id: 1,
        optionId: 10,
        name: "Premium Leather Color",
      });
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          optionId: 10,
          name: "Premium Leather Color",
          deleted: 0,
        }),
      );
      expect(repository.save).toHaveBeenCalledWith(mockOptionItemEntity);
    });

    it("should create option item with default values", async () => {
      // Arrange
      const createDto: CreateOptionItemDto = {
        optionId: 10,
        name: "Basic Item",
      };

      const entityWithDefaults = {
        ...mockOptionItemEntity,
        name: "Basic Item",
        leatherId: 0,
        userColor: 0,
        userLeather: 0,
        price1: 0,
        price2: 0,
        price3: 0,
        price4: 0,
        price5: 0,
        price6: 0,
        price7: 0,
        sequence: 0,
      };

      repository.create.mockReturnValue(entityWithDefaults as OptionItemEntity);
      repository.save.mockResolvedValue(entityWithDefaults as OptionItemEntity);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toMatchObject({
        name: "Basic Item",
        leatherId: 0,
        price1: 0,
      });
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          leatherId: 0,
          userColor: 0,
          userLeather: 0,
          sequence: 0,
          deleted: 0,
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should find option item by ID", async () => {
      // Arrange
      const itemId = 1;
      repository.findOne.mockResolvedValue(mockOptionItemEntity);

      // Act
      const result = await service.findOne(itemId);

      // Assert
      expect(result).toMatchObject({
        id: 1,
        name: "Premium Leather Color",
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: itemId, deleted: 0 },
      });
    });

    it("should throw NotFoundException when option item not found", async () => {
      // Arrange
      const itemId = 999;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(itemId)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: itemId, deleted: 0 },
      });
    });

    it("should not find soft-deleted option items", async () => {
      // Arrange
      const itemId = 1;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(itemId)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: itemId, deleted: 0 },
      });
    });
  });

  describe("findAll", () => {
    it("should return all option items with pagination", async () => {
      // Arrange
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockOptionItemEntity]),
      } as unknown as SelectQueryBuilder<OptionItemEntity>;

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.findAll(1, 10);

      // Assert
      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: "Premium Leather Color",
          }),
        ]),
        total: 1,
        pages: 1,
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("item.deleted = 0");
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it("should filter by optionId", async () => {
      // Arrange
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockOptionItemEntity]),
      } as unknown as SelectQueryBuilder<OptionItemEntity>;

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      await service.findAll(1, 10, 10);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "item.option_id = :optionId",
        { optionId: 10 },
      );
    });

    it("should filter by leatherId", async () => {
      // Arrange
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockOptionItemEntity]),
      } as unknown as SelectQueryBuilder<OptionItemEntity>;

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      await service.findAll(1, 10, undefined, 5);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "item.leather_id = :leatherId",
        { leatherId: 5 },
      );
    });

    it("should filter by search term", async () => {
      // Arrange
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockOptionItemEntity]),
      } as unknown as SelectQueryBuilder<OptionItemEntity>;

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      await service.findAll(1, 10, undefined, undefined, "Premium");

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "item.name ILIKE :search",
        { search: "%Premium%" },
      );
    });

    it("should order by sequence and name", async () => {
      // Arrange
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockOptionItemEntity]),
      } as unknown as SelectQueryBuilder<OptionItemEntity>;

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      await service.findAll(1, 10);

      // Assert
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        "item.sequence",
        "ASC",
      );
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith(
        "item.name",
        "ASC",
      );
    });
  });

  describe("findByOptionId", () => {
    it("should find all items for a specific option", async () => {
      // Arrange
      const optionId = 10;
      repository.find.mockResolvedValue([mockOptionItemEntity]);

      // Act
      const result = await service.findByOptionId(optionId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        optionId: 10,
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { optionId, deleted: 0 },
        order: { sequence: "ASC", name: "ASC" },
      });
    });

    it("should return empty array when no items found", async () => {
      // Arrange
      const optionId = 999;
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findByOptionId(optionId);

      // Assert
      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { optionId, deleted: 0 },
        order: { sequence: "ASC", name: "ASC" },
      });
    });
  });

  describe("update", () => {
    it("should update option item successfully", async () => {
      // Arrange
      const itemId = 1;
      const updateDto: UpdateOptionItemDto = {
        name: "Updated Name",
        price1: 200,
        sequence: 5,
      };

      const updatedEntity = {
        ...mockOptionItemEntity,
        name: "Updated Name",
        price1: 200,
        sequence: 5,
      };

      repository.findOne.mockResolvedValue({ ...mockOptionItemEntity } as any);
      repository.save.mockResolvedValue(updatedEntity as OptionItemEntity);

      // Act
      const result = await service.update(itemId, updateDto);

      // Assert
      expect(result).toMatchObject({
        name: "Updated Name",
        price1: 200,
        sequence: 5,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: itemId, deleted: 0 },
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it("should update partial fields", async () => {
      // Arrange
      const itemId = 1;
      const updateDto: UpdateOptionItemDto = {
        price1: 300,
      };

      repository.findOne.mockResolvedValue({ ...mockOptionItemEntity } as any);
      repository.save.mockResolvedValue({ ...mockOptionItemEntity } as any);

      // Act
      await service.update(itemId, updateDto);

      // Assert
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when item not found", async () => {
      // Arrange
      const itemId = 999;
      const updateDto: UpdateOptionItemDto = { name: "New Name" };
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(itemId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should soft delete option item successfully", async () => {
      // Arrange
      const itemId = 1;
      const deletedEntity = { ...mockOptionItemEntity, deleted: 1 };
      repository.findOne.mockResolvedValue({ ...mockOptionItemEntity } as any);
      repository.save.mockResolvedValue(deletedEntity as OptionItemEntity);

      // Act
      await service.remove(itemId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: itemId, deleted: 0 },
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ deleted: 1 }),
      );
    });

    it("should throw NotFoundException when item not found", async () => {
      // Arrange
      const itemId = 999;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(itemId)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("findActiveItems", () => {
    it("should return all active option items", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockOptionItemEntity]);

      // Act
      const result = await service.findActiveItems();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        isActive: true,
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { deleted: 0 },
        order: { sequence: "ASC", name: "ASC" },
      });
    });

    it("should return empty array when no active items", async () => {
      // Arrange
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findActiveItems();

      // Assert
      expect(result).toEqual([]);
    });
  });
});
