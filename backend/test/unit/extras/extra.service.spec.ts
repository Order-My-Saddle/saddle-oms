import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, Like, IsNull } from "typeorm";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { ExtraService } from "../../../src/extras/extra.service";
import { ExtraEntity } from "../../../src/extras/infrastructure/persistence/relational/entities/extra.entity";
import { CreateExtraDto } from "../../../src/extras/dto/create-extra.dto";
import { UpdateExtraDto } from "../../../src/extras/dto/update-extra.dto";

describe("ExtraService", () => {
  let service: ExtraService;
  let repository: jest.Mocked<Repository<ExtraEntity>>;

  const mockExtraEntity: ExtraEntity = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Complete Re-Flock",
    description: "Complete re-flocking service",
    price1: 250,
    price2: 150,
    price3: 135,
    price4: 290,
    price5: 290,
    price6: 0,
    price7: 0,
    sequence: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: null,
  } as ExtraEntity;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtraService,
        {
          provide: getRepositoryToken(ExtraEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ExtraService>(ExtraService);
    repository = module.get(getRepositoryToken(ExtraEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new extra successfully", async () => {
      const createDto: CreateExtraDto = {
        name: "New Extra",
        description: "New description",
        price1: 100,
        price2: 80,
        price3: 70,
        price4: 120,
        price5: 120,
        sequence: 2,
      };

      const newExtraEntity = {
        ...createDto,
        price6: 0,
        price7: 0,
        id: "223e4567-e89b-12d3-a456-426614174000",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(newExtraEntity as ExtraEntity);
      repository.save.mockResolvedValue(newExtraEntity as ExtraEntity);

      const result = await service.create(createDto);

      expect(result).toMatchObject({
        name: createDto.name,
        price1: createDto.price1,
        price2: createDto.price2,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: createDto.name, deletedAt: IsNull() },
      });
      expect(repository.create).toHaveBeenCalledWith({
        name: "New Extra",
        description: "New description",
        price1: 100,
        price2: 80,
        price3: 70,
        price4: 120,
        price5: 120,
        price6: 0,
        price7: 0,
        sequence: 2,
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it("should default missing prices to 0", async () => {
      const createDto: CreateExtraDto = {
        name: "Minimal Extra",
        price1: 50,
      };

      const newExtraEntity = {
        ...createDto,
        price2: 0,
        price3: 0,
        price4: 0,
        price5: 0,
        price6: 0,
        price7: 0,
        sequence: 0,
        id: "223e4567-e89b-12d3-a456-426614174000",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(newExtraEntity as ExtraEntity);
      repository.save.mockResolvedValue(newExtraEntity as ExtraEntity);

      await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          price1: 50,
          price2: 0,
          price3: 0,
          price4: 0,
          price5: 0,
          price6: 0,
          price7: 0,
          sequence: 0,
        }),
      );
    });

    it("should throw ConflictException when extra name already exists", async () => {
      const createDto: CreateExtraDto = {
        name: "Existing Extra",
      };

      repository.findOne.mockResolvedValue(mockExtraEntity);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should find extra by UUID", async () => {
      const extraId = "123e4567-e89b-12d3-a456-426614174000";
      repository.findOne.mockResolvedValue(mockExtraEntity);

      const result = await service.findOne(extraId);

      expect(result).toMatchObject({
        id: mockExtraEntity.id,
        name: mockExtraEntity.name,
        price1: mockExtraEntity.price1,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: extraId, deletedAt: IsNull() },
      });
    });

    it("should throw NotFoundException when extra not found", async () => {
      const extraId = "999e4567-e89b-12d3-a456-426614174000";
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(extraId)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAll", () => {
    it("should return paginated extras with default parameters", async () => {
      const extras = [mockExtraEntity];
      const total = 1;
      repository.findAndCount.mockResolvedValue([extras, total]);

      const result = await service.findAll();

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: mockExtraEntity.id,
            name: mockExtraEntity.name,
            price1: mockExtraEntity.price1,
          }),
        ]),
        total: 1,
        pages: 1,
      });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        order: { sequence: "ASC", name: "ASC" },
        skip: 0,
        take: 10,
      });
    });

    it("should search by name", async () => {
      repository.findAndCount.mockResolvedValue([[mockExtraEntity], 1]);

      const result = await service.findAll(1, 10, "Flock");

      expect(result.data).toHaveLength(1);
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: IsNull(), name: Like("%Flock%") },
        order: { sequence: "ASC", name: "ASC" },
        skip: 0,
        take: 10,
      });
    });

    it("should handle pagination", async () => {
      repository.findAndCount.mockResolvedValue([[mockExtraEntity], 25]);

      const result = await service.findAll(2, 10);

      expect(result.pages).toBe(3);
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        order: { sequence: "ASC", name: "ASC" },
        skip: 10,
        take: 10,
      });
    });

    it("should return empty array when no extras found", async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll();

      expect(result).toEqual({ data: [], total: 0, pages: 0 });
    });
  });

  describe("update", () => {
    it("should update extra prices successfully", async () => {
      const extraId = "123e4567-e89b-12d3-a456-426614174000";
      const updateDto: UpdateExtraDto = {
        price1: 300,
        price2: 200,
      };

      const updatedEntity = { ...mockExtraEntity, ...updateDto };

      repository.findOne.mockResolvedValueOnce(mockExtraEntity);
      repository.save.mockResolvedValue(updatedEntity as ExtraEntity);

      const result = await service.update(extraId, updateDto);

      expect(result).toMatchObject({
        price1: 300,
        price2: 200,
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when extra not found", async () => {
      const extraId = "999e4567-e89b-12d3-a456-426614174000";
      const updateDto: UpdateExtraDto = { name: "New name" };
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(extraId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("should check for name conflicts when updating name", async () => {
      const extraId = "123e4567-e89b-12d3-a456-426614174000";
      const updateDto: UpdateExtraDto = { name: "New Unique Name" };

      repository.findOne
        .mockResolvedValueOnce(mockExtraEntity)
        .mockResolvedValueOnce(null);

      repository.save.mockResolvedValue({
        ...mockExtraEntity,
        ...updateDto,
      } as ExtraEntity);

      const result = await service.update(extraId, updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(repository.findOne).toHaveBeenCalledTimes(2);
    });

    it("should throw ConflictException when updating to existing name", async () => {
      const extraId = "123e4567-e89b-12d3-a456-426614174000";
      const updateDto: UpdateExtraDto = { name: "Existing Name" };
      const existingExtraWithSameName = {
        ...mockExtraEntity,
        id: "999e4567-e89b-12d3-a456-426614174000",
        name: "Existing Name",
      };

      repository.findOne
        .mockResolvedValueOnce(mockExtraEntity)
        .mockResolvedValueOnce(existingExtraWithSameName as ExtraEntity);

      await expect(service.update(extraId, updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("should not check for conflicts when name is not changed", async () => {
      const extraId = "123e4567-e89b-12d3-a456-426614174000";
      const updateDto: UpdateExtraDto = { price1: 999, sequence: 5 };

      repository.findOne.mockResolvedValue(mockExtraEntity);
      repository.save.mockResolvedValue({
        ...mockExtraEntity,
        ...updateDto,
      } as ExtraEntity);

      await service.update(extraId, updateDto);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should soft delete extra successfully", async () => {
      const extraId = "123e4567-e89b-12d3-a456-426614174000";
      repository.findOne.mockResolvedValue(mockExtraEntity);
      repository.save.mockResolvedValue({
        ...mockExtraEntity,
        deletedAt: new Date(),
      } as ExtraEntity);

      await service.remove(extraId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: extraId, deletedAt: IsNull() },
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          deletedAt: expect.any(Date),
        }),
      );
    });

    it("should throw NotFoundException when extra not found", async () => {
      const extraId = "999e4567-e89b-12d3-a456-426614174000";
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove(extraId)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("findActiveExtras", () => {
    it("should return all active extras", async () => {
      repository.find.mockResolvedValue([mockExtraEntity]);

      const result = await service.findActiveExtras();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: mockExtraEntity.id,
        name: mockExtraEntity.name,
        price1: mockExtraEntity.price1,
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        order: { sequence: "ASC", name: "ASC" },
      });
    });

    it("should return empty array when no active extras", async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findActiveExtras();

      expect(result).toEqual([]);
    });
  });
});
