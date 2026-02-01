import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { SaddleService } from "../../../src/saddles/saddle.service";
import { SaddleEntity } from "../../../src/saddles/infrastructure/persistence/relational/entities/saddle.entity";
import { CreateSaddleDto } from "../../../src/saddles/dto/create-saddle.dto";
import { UpdateSaddleDto } from "../../../src/saddles/dto/update-saddle.dto";
import { SaddleDto } from "../../../src/saddles/dto/saddle.dto";

describe("SaddleService", () => {
  let service: SaddleService;
  let repository: jest.Mocked<Repository<SaddleEntity>>;

  const mockSaddleEntity: SaddleEntity = {
    id: 1,
    factoryEu: 1,
    factoryGb: 2,
    factoryUs: 3,
    factoryCa: 4,
    factoryAud: 5,
    factoryDe: 6,
    factoryNl: 7,
    brand: "Test Brand",
    modelName: "Test Model",
    presets: "1,2,3",
    active: 1,
    type: 0,
    sequence: 10,
    deleted: 0,
    isActive: true,
    displayName: "Test Brand - Test Model",
    getFactoryForRegion: jest.fn(),
    getAllFactories: jest.fn(),
    getPresetsArray: jest.fn(),
  } as unknown as SaddleEntity;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getMany: jest.fn(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaddleService,
        {
          provide: getRepositoryToken(SaddleEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SaddleService>(SaddleService);
    repository = module.get(getRepositoryToken(SaddleEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new saddle successfully", async () => {
      // Arrange
      const createDto: CreateSaddleDto = {
        factoryEu: 1,
        factoryGb: 2,
        factoryUs: 3,
        factoryCa: 4,
        brand: "New Brand",
        modelName: "New Model",
        presets: "1,2",
        active: 1,
        type: 0,
        sequence: 20,
      };

      const newSaddleEntity = {
        ...createDto,
        id: 2,
        deleted: 0,
      };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(newSaddleEntity as SaddleEntity);
      repository.save.mockResolvedValue(newSaddleEntity as SaddleEntity);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toMatchObject({
        brand: createDto.brand,
        modelName: createDto.modelName,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          brand: createDto.brand,
          modelName: createDto.modelName,
          deleted: 0,
        },
      });
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
    });

    it("should apply default values when not provided", async () => {
      // Arrange
      const createDto: CreateSaddleDto = {
        brand: "Test Brand",
        modelName: "Test Model",
      };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue({} as SaddleEntity);
      repository.save.mockResolvedValue(mockSaddleEntity);

      // Act
      await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          factoryEu: 0,
          factoryGb: 0,
          factoryUs: 0,
          factoryCa: 0,
          presets: "",
          active: 1,
          type: 0,
          sequence: 0,
          deleted: 0,
        }),
      );
    });

    it("should throw ConflictException when brand/model combination already exists", async () => {
      // Arrange
      const createDto: CreateSaddleDto = {
        brand: "Test Brand",
        modelName: "Test Model",
      };

      repository.findOne.mockResolvedValue(mockSaddleEntity);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should find saddle by ID", async () => {
      // Arrange
      const saddleId = 1;
      repository.findOne.mockResolvedValue(mockSaddleEntity);

      // Act
      const result = await service.findOne(saddleId);

      // Assert
      expect(result).toMatchObject({
        id: mockSaddleEntity.id,
        brand: mockSaddleEntity.brand,
        modelName: mockSaddleEntity.modelName,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: saddleId, deleted: 0 },
      });
    });

    it("should throw NotFoundException when saddle not found", async () => {
      // Arrange
      const saddleId = 999;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(saddleId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: saddleId, deleted: 0 },
      });
    });
  });

  describe("findAll", () => {
    beforeEach(() => {
      repository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as unknown as SelectQueryBuilder<SaddleEntity>,
      );
    });

    it("should return paginated saddles with default parameters", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSaddleEntity]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: mockSaddleEntity.id,
            brand: mockSaddleEntity.brand,
          }),
        ]),
        total: 1,
        pages: 1,
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("saddle.deleted = 0");
    });

    it("should filter by ID", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSaddleEntity]);

      // Act
      await service.findAll(1, 10, 1);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "saddle.id = :id",
        { id: 1 },
      );
    });

    it("should filter by brand", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSaddleEntity]);

      // Act
      await service.findAll(1, 10, undefined, "Test");

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "saddle.brand ILIKE :brand",
        { brand: "%Test%" },
      );
    });

    it("should filter by modelName", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSaddleEntity]);

      // Act
      await service.findAll(1, 10, undefined, undefined, "Model");

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "saddle.model_name ILIKE :modelName",
        { modelName: "%Model%" },
      );
    });

    it("should filter by sequence", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSaddleEntity]);

      // Act
      await service.findAll(1, 10, undefined, undefined, undefined, 10);

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "saddle.sequence = :sequence",
        { sequence: 10 },
      );
    });

    it("should filter by type", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSaddleEntity]);

      // Act
      await service.findAll(
        1,
        10,
        undefined,
        undefined,
        undefined,
        undefined,
        0,
      );

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "saddle.type = :type",
        { type: 0 },
      );
    });

    it("should filter by search term", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSaddleEntity]);

      // Act
      await service.findAll(
        1,
        10,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "test",
      );

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "(saddle.brand ILIKE :search OR saddle.model_name ILIKE :search)",
        { search: "%test%" },
      );
    });

    it("should filter active only when activeOnly is true", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSaddleEntity]);

      // Act
      await service.findAll(
        1,
        10,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      );

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "saddle.active = 1",
      );
    });

    it("should filter by active string parameter", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSaddleEntity]);

      // Act
      await service.findAll(
        1,
        10,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        false,
        "true",
      );

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "saddle.active = 1",
      );
    });

    it("should apply pagination and ordering", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(25);
      mockQueryBuilder.getMany.mockResolvedValue([mockSaddleEntity]);

      // Act
      const result = await service.findAll(2, 10);

      // Assert
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        "saddle.sequence",
        "ASC",
      );
      expect(result.pages).toBe(3);
    });
  });

  describe("findByBrand", () => {
    it("should find saddles by brand", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockSaddleEntity]);

      // Act
      const result = await service.findByBrand("Test Brand");

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        brand: mockSaddleEntity.brand,
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { brand: "Test Brand", deleted: 0 },
        order: { sequence: "ASC", modelName: "ASC" },
      });
    });
  });

  describe("findByType", () => {
    it("should find saddles by type", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockSaddleEntity]);

      // Act
      const result = await service.findByType(0);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: mockSaddleEntity.type,
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { type: 0, deleted: 0 },
        order: { sequence: "ASC", brand: "ASC", modelName: "ASC" },
      });
    });
  });

  describe("findActiveSaddles", () => {
    it("should return all active saddles", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockSaddleEntity]);

      // Act
      const result = await service.findActiveSaddles();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockSaddleEntity.id,
        active: 1,
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { deleted: 0, active: 1 },
        order: { sequence: "ASC", brand: "ASC", modelName: "ASC" },
      });
    });
  });

  describe("update", () => {
    it("should update saddle successfully", async () => {
      // Arrange
      const saddleId = 1;
      const updateDto: UpdateSaddleDto = {
        brand: "Updated Brand",
        sequence: 15,
      };

      const updatedEntity = {
        ...mockSaddleEntity,
        ...updateDto,
      };

      repository.findOne
        .mockResolvedValueOnce(mockSaddleEntity)
        .mockResolvedValueOnce(null);
      repository.save.mockResolvedValue(updatedEntity as SaddleEntity);

      // Act
      const result = await service.update(saddleId, updateDto);

      // Assert
      expect(result).toMatchObject({
        brand: updateDto.brand,
        sequence: updateDto.sequence,
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when saddle not found", async () => {
      // Arrange
      const saddleId = 999;
      const updateDto: UpdateSaddleDto = { brand: "New Brand" };
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(saddleId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("should check for conflicts when brand is changed", async () => {
      // Arrange
      const saddleId = 1;
      const updateDto: UpdateSaddleDto = { brand: "New Brand" };

      repository.findOne
        .mockResolvedValueOnce(mockSaddleEntity)
        .mockResolvedValueOnce(null);
      repository.save.mockResolvedValue({
        ...mockSaddleEntity,
        ...updateDto,
      } as SaddleEntity);

      // Act
      await service.update(saddleId, updateDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledTimes(2);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          brand: updateDto.brand,
          modelName: mockSaddleEntity.modelName,
          deleted: 0,
        },
      });
    });

    it("should check for conflicts when modelName is changed", async () => {
      // Arrange
      const saddleId = 1;
      const updateDto: UpdateSaddleDto = { modelName: "New Model" };

      repository.findOne
        .mockResolvedValueOnce(mockSaddleEntity)
        .mockResolvedValueOnce(null);
      repository.save.mockResolvedValue({
        ...mockSaddleEntity,
        ...updateDto,
      } as SaddleEntity);

      // Act
      await service.update(saddleId, updateDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledTimes(2);
    });

    it("should throw ConflictException when updating to existing brand/model", async () => {
      // Arrange
      const saddleId = 1;
      const updateDto: UpdateSaddleDto = { brand: "Existing Brand" };
      const existingSaddle = { ...mockSaddleEntity, id: 2 };

      repository.findOne
        .mockResolvedValueOnce(mockSaddleEntity)
        .mockResolvedValueOnce(existingSaddle as SaddleEntity);

      // Act & Assert
      await expect(service.update(saddleId, updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("should update all factory fields when provided", async () => {
      // Arrange
      const saddleId = 1;
      const updateDto: UpdateSaddleDto = {
        factoryEu: 10,
        factoryGb: 20,
        factoryUs: 30,
        factoryCa: 40,
        factoryAud: 50,
        factoryDe: 60,
        factoryNl: 70,
      };

      repository.findOne.mockResolvedValue(mockSaddleEntity);
      repository.save.mockResolvedValue({
        ...mockSaddleEntity,
        ...updateDto,
      } as SaddleEntity);

      // Act
      await service.update(saddleId, updateDto);

      // Assert
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
    });
  });

  describe("remove", () => {
    it("should soft delete saddle successfully", async () => {
      // Arrange
      const saddleId = 1;
      repository.findOne.mockResolvedValue(mockSaddleEntity);
      repository.save.mockResolvedValue({
        ...mockSaddleEntity,
        deleted: 1,
      } as SaddleEntity);

      // Act
      await service.remove(saddleId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: saddleId, deleted: 0 },
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ deleted: 1 }),
      );
    });

    it("should throw NotFoundException when saddle not found", async () => {
      // Arrange
      const saddleId = 999;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(saddleId)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("getUniqueBrands", () => {
    beforeEach(() => {
      repository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as unknown as SelectQueryBuilder<SaddleEntity>,
      );
    });

    it("should return unique brand names", async () => {
      // Arrange
      mockQueryBuilder.getRawMany.mockResolvedValue([
        { brand: "Brand A" },
        { brand: "Brand B" },
        { brand: "Brand C" },
      ]);

      // Act
      const result = await service.getUniqueBrands();

      // Assert
      expect(result).toEqual(["Brand A", "Brand B", "Brand C"]);
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        "DISTINCT saddle.brand",
        "brand",
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("saddle.deleted = 0");
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        "saddle.brand",
        "ASC",
      );
    });

    it("should return empty array when no brands found", async () => {
      // Arrange
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      // Act
      const result = await service.getUniqueBrands();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getNextSequence", () => {
    beforeEach(() => {
      repository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as unknown as SelectQueryBuilder<SaddleEntity>,
      );
    });

    it("should return next sequence number", async () => {
      // Arrange
      mockQueryBuilder.getRawOne.mockResolvedValue({ maxSequence: 100 });

      // Act
      const result = await service.getNextSequence();

      // Assert
      expect(result).toEqual({ nextSequence: 101 });
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(
        "MAX(saddle.sequence)",
        "maxSequence",
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("saddle.deleted = 0");
    });

    it("should return 1 when no saddles exist", async () => {
      // Arrange
      mockQueryBuilder.getRawOne.mockResolvedValue({ maxSequence: null });

      // Act
      const result = await service.getNextSequence();

      // Assert
      expect(result).toEqual({ nextSequence: 1 });
    });

    it("should return 1 when result is empty", async () => {
      // Arrange
      mockQueryBuilder.getRawOne.mockResolvedValue(null);

      // Act
      const result = await service.getNextSequence();

      // Assert
      expect(result).toEqual({ nextSequence: 1 });
    });
  });
});
