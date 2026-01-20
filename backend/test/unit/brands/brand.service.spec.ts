import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, Like, IsNull } from "typeorm";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { BrandService } from "../../../src/brands/brand.service";
import { BrandEntity } from "../../../src/brands/infrastructure/persistence/relational/entities/brand.entity";
import { CreateBrandDto } from "../../../src/brands/dto/create-brand.dto";
import { UpdateBrandDto } from "../../../src/brands/dto/update-brand.dto";
import { BrandDto } from "../../../src/brands/dto/brand.dto";

describe("BrandService", () => {
  let service: BrandService;
  let repository: jest.Mocked<Repository<BrandEntity>>;

  const mockBrandEntity: BrandEntity = {
    id: 101,
    name: "Premium Leather Co",
    createdAt: new Date("2023-01-01T00:00:00Z"),
    updatedAt: new Date("2023-01-01T00:00:00Z"),
    deletedAt: null,
  } as BrandEntity;

  const mockBrandDto: BrandDto = {
    id: 101,
    name: "Premium Leather Co",
    createdAt: new Date("2023-01-01T00:00:00Z"),
    updatedAt: new Date("2023-01-01T00:00:00Z"),
    isActive: true,
    displayName: "Premium Leather Co",
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandService,
        {
          provide: getRepositoryToken(BrandEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BrandService>(BrandService);
    repository = module.get(getRepositoryToken(BrandEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new brand successfully", async () => {
      // Arrange
      const createDto: CreateBrandDto = {
        name: "New Brand",
      };

      const newBrandEntity = {
        ...createDto,
        id: 102,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      repository.findOne.mockResolvedValue(null); // No existing brand
      repository.create.mockReturnValue(newBrandEntity as BrandEntity);
      repository.save.mockResolvedValue(newBrandEntity as BrandEntity);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toMatchObject({
        name: createDto.name,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: createDto.name, deletedAt: IsNull() },
      });
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createDto.name,
        }),
      );
      expect(repository.save).toHaveBeenCalledWith(newBrandEntity);
    });

    it("should throw ConflictException when brand name already exists", async () => {
      // Arrange
      const createDto: CreateBrandDto = {
        name: "Existing Brand",
      };

      repository.findOne.mockResolvedValue(mockBrandEntity);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: createDto.name, deletedAt: IsNull() },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should find brand by ID", async () => {
      // Arrange
      const brandId = 101;
      repository.findOne.mockResolvedValue(mockBrandEntity);

      // Act
      const result = await service.findOne(brandId);

      // Assert
      expect(result).toMatchObject({
        id: mockBrandEntity.id,
        name: mockBrandEntity.name,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: brandId, deletedAt: IsNull() },
      });
    });

    it("should throw NotFoundException when brand not found", async () => {
      // Arrange
      const brandId = 999;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(brandId)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: brandId, deletedAt: IsNull() },
      });
    });
  });

  describe("findAll", () => {
    it("should return all active brands", async () => {
      // Arrange
      const brands = [mockBrandEntity];
      const total = 1;
      repository.findAndCount.mockResolvedValue([brands, total]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: mockBrandEntity.id,
            name: mockBrandEntity.name,
          }),
        ]),
        total: 1,
        pages: 1,
      });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        order: { name: "ASC" },
        skip: 0,
        take: 10,
      });
    });

    it("should search by name", async () => {
      // Arrange
      const brands = [mockBrandEntity];
      const total = 1;
      repository.findAndCount.mockResolvedValue([brands, total]);

      // Act
      const result = await service.findAll(1, 10, "Premium");

      // Assert
      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: mockBrandEntity.id,
            name: mockBrandEntity.name,
          }),
        ]),
        total: 1,
        pages: 1,
      });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: IsNull(), name: Like("%Premium%") },
        order: { name: "ASC" },
        skip: 0,
        take: 10,
      });
    });
  });

  describe("update", () => {
    it("should update brand successfully", async () => {
      // Arrange
      const brandId = 101;
      const updateDto: UpdateBrandDto = {
        name: "Updated Brand Name",
      };

      const updatedEntity = {
        ...mockBrandEntity,
        ...updateDto,
        updatedAt: new Date(),
      };

      repository.findOne
        .mockResolvedValueOnce(mockBrandEntity) // Find current brand
        .mockResolvedValueOnce(null); // No conflict with name
      repository.save.mockResolvedValue(updatedEntity as BrandEntity);

      // Act
      const result = await service.update(brandId, updateDto);

      // Assert
      expect(result).toMatchObject({
        name: updateDto.name,
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
    });

    it("should check for name conflicts when updating name", async () => {
      // Arrange
      const brandId = 101;
      const updateDto: UpdateBrandDto = {
        name: "New Unique Name",
      };

      repository.findOne
        .mockResolvedValueOnce(mockBrandEntity) // Find current brand
        .mockResolvedValueOnce(null); // No conflict

      repository.save.mockResolvedValue({
        ...mockBrandEntity,
        ...updateDto,
      } as BrandEntity);

      // Act
      const result = await service.update(brandId, updateDto);

      // Assert
      expect(result.name).toBe(updateDto.name);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: brandId, deletedAt: IsNull() },
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          name: updateDto.name,
          deletedAt: IsNull(),
        },
      });
    });

    it("should throw NotFoundException when brand not found", async () => {
      // Arrange
      const brandId = 999;
      const updateDto: UpdateBrandDto = { name: "New name" };
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(brandId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("should throw ConflictException when updating to existing name", async () => {
      // Arrange
      const brandId = 101;
      const updateDto: UpdateBrandDto = { name: "Existing Name" };
      const existingBrandWithSameName = {
        ...mockBrandEntity,
        id: 999,
        name: "Existing Name",
      };

      repository.findOne
        .mockResolvedValueOnce(mockBrandEntity) // Find current brand
        .mockResolvedValueOnce(existingBrandWithSameName as BrandEntity); // Conflict found

      // Act & Assert
      await expect(service.update(brandId, updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should soft delete brand successfully", async () => {
      // Arrange
      const brandId = 101;
      repository.findOne.mockResolvedValue(mockBrandEntity);
      repository.save.mockResolvedValue({
        ...mockBrandEntity,
        deletedAt: new Date(),
      } as BrandEntity);

      // Act
      await service.remove(brandId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: brandId, deletedAt: IsNull() },
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ deletedAt: expect.any(Date) }),
      );
    });

    it("should throw NotFoundException when brand not found", async () => {
      // Arrange
      const brandId = 999;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(brandId)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("findActiveBrands", () => {
    it("should return all active brands", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockBrandEntity]);

      // Act
      const result = await service.findActiveBrands();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockBrandEntity.id,
        name: mockBrandEntity.name,
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        order: { name: "ASC" },
      });
    });
  });
});
