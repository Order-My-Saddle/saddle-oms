import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { PresetService } from "../../../src/presets/preset.service";
import { PresetEntity } from "../../../src/presets/infrastructure/persistence/relational/entities/preset.entity";
import { CreatePresetDto } from "../../../src/presets/dto/create-preset.dto";
import { UpdatePresetDto } from "../../../src/presets/dto/update-preset.dto";
import { PresetDto } from "../../../src/presets/dto/preset.dto";

describe("PresetService", () => {
  let service: PresetService;
  let repository: jest.Mocked<Repository<PresetEntity>>;

  const mockPresetEntity: PresetEntity = {
    id: 1,
    name: "Standard Setup",
    sequence: 1,
    deleted: 0,
  } as PresetEntity;

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
        PresetService,
        {
          provide: getRepositoryToken(PresetEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PresetService>(PresetService);
    repository = module.get(getRepositoryToken(PresetEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new preset successfully", async () => {
      // Arrange
      const createDto: CreatePresetDto = {
        name: "New Preset",
        sequence: 5,
      };

      const newPresetEntity = {
        ...createDto,
        id: 2,
        deleted: 0,
      };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(newPresetEntity as PresetEntity);
      repository.save.mockResolvedValue(newPresetEntity as PresetEntity);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toMatchObject({
        isActive: true,
        displayName: createDto.name,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: createDto.name, deleted: 0 },
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw ConflictException when preset name already exists", async () => {
      // Arrange
      const createDto: CreatePresetDto = {
        name: "Existing Preset",
      };

      repository.findOne.mockResolvedValue(mockPresetEntity);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { name: createDto.name, deleted: 0 },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should find preset by integer ID", async () => {
      // Arrange
      const presetId = 1;
      repository.findOne.mockResolvedValue(mockPresetEntity);

      // Act
      const result = await service.findOne(presetId);

      // Assert
      expect(result).toMatchObject({
        isActive: true,
        displayName: mockPresetEntity.name,
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: presetId, deleted: 0 },
      });
    });

    it("should throw NotFoundException when preset not found", async () => {
      // Arrange
      const presetId = 999;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(presetId)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: presetId, deleted: 0 },
      });
    });
  });

  describe("findAll", () => {
    it("should return paginated presets with default parameters", async () => {
      // Arrange
      const presets = [mockPresetEntity];
      const total = 1;
      repository.findAndCount.mockResolvedValue([presets, total]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            isActive: true,
            displayName: mockPresetEntity.name,
          }),
        ]),
        total: 1,
        pages: 1,
      });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { deleted: 0 },
        order: { sequence: "ASC", name: "ASC" },
        skip: 0,
        take: 10,
      });
    });

    it("should search by name", async () => {
      // Arrange
      const presets = [mockPresetEntity];
      const total = 1;
      repository.findAndCount.mockResolvedValue([presets, total]);

      // Act
      const result = await service.findAll(1, 10, "Standard");

      // Assert
      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            displayName: mockPresetEntity.name,
          }),
        ]),
        total: 1,
        pages: 1,
      });
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { deleted: 0, name: Like("%Standard%") },
        order: { sequence: "ASC", name: "ASC" },
        skip: 0,
        take: 10,
      });
    });

    it("should handle pagination", async () => {
      // Arrange
      const presets = [mockPresetEntity];
      const total = 25;
      repository.findAndCount.mockResolvedValue([presets, total]);

      // Act
      const result = await service.findAll(2, 10);

      // Assert
      expect(result.pages).toBe(3);
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { deleted: 0 },
        order: { sequence: "ASC", name: "ASC" },
        skip: 10,
        take: 10,
      });
    });

    it("should return empty array when no presets found", async () => {
      // Arrange
      repository.findAndCount.mockResolvedValue([[], 0]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual({
        data: [],
        total: 0,
        pages: 0,
      });
    });

    it("should sort by sequence and name", async () => {
      // Arrange
      const presets = [mockPresetEntity];
      repository.findAndCount.mockResolvedValue([presets, 1]);

      // Act
      await service.findAll();

      // Assert
      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { sequence: "ASC", name: "ASC" },
        }),
      );
    });
  });

  describe("update", () => {
    it("should update preset successfully", async () => {
      // Arrange
      const presetId = 1;
      const updateDto: UpdatePresetDto = {
        name: "Updated Preset",
        sequence: 10,
      };

      const updatedEntity = {
        ...mockPresetEntity,
        ...updateDto,
      };

      repository.findOne
        .mockResolvedValueOnce(mockPresetEntity)
        .mockResolvedValueOnce(null);
      repository.save.mockResolvedValue(updatedEntity as PresetEntity);

      // Act
      const result = await service.update(presetId, updateDto);

      // Assert
      expect(result).toMatchObject({
        isActive: true,
        displayName: updateDto.name,
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when preset not found", async () => {
      // Arrange
      const presetId = 999;
      const updateDto: UpdatePresetDto = { name: "New name" };
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(presetId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("should check for name conflicts when updating name", async () => {
      // Arrange
      const presetId = 1;
      const updateDto: UpdatePresetDto = {
        name: "New Unique Name",
      };

      repository.findOne
        .mockResolvedValueOnce({ ...mockPresetEntity })
        .mockResolvedValueOnce(null);

      repository.save.mockResolvedValue({
        ...mockPresetEntity,
        ...updateDto,
      } as PresetEntity);

      // Act
      const result = await service.update(presetId, updateDto);

      // Assert
      expect(result.displayName).toBe(updateDto.name);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: presetId, deleted: 0 },
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          name: updateDto.name,
          deleted: 0,
        },
      });
    });

    it("should throw ConflictException when updating to existing name", async () => {
      // Arrange
      const presetId = 1;
      const updateDto: UpdatePresetDto = { name: "Existing Name" };
      const existingPresetWithSameName = {
        ...mockPresetEntity,
        id: 2,
        name: "Existing Name",
      };

      repository.findOne
        .mockResolvedValueOnce({ ...mockPresetEntity })
        .mockResolvedValueOnce(existingPresetWithSameName as PresetEntity);

      // Act & Assert
      await expect(service.update(presetId, updateDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("should not check for conflicts when name is not changed", async () => {
      // Arrange
      const presetId = 1;
      const updateDto: UpdatePresetDto = {
        sequence: 15,
      };

      repository.findOne.mockResolvedValue({ ...mockPresetEntity });
      repository.save.mockResolvedValue({
        ...mockPresetEntity,
        ...updateDto,
      } as PresetEntity);

      // Act
      await service.update(presetId, updateDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalled();
    });

    it("should use Object.assign to update fields", async () => {
      // Arrange
      const presetId = 1;
      const updateDto: UpdatePresetDto = {
        name: "Partially Updated",
        sequence: 20,
      };

      repository.findOne
        .mockResolvedValueOnce({ ...mockPresetEntity })
        .mockResolvedValueOnce(null);
      repository.save.mockResolvedValue({
        ...mockPresetEntity,
        ...updateDto,
      } as PresetEntity);

      // Act
      await service.update(presetId, updateDto);

      // Assert
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: updateDto.name,
          sequence: updateDto.sequence,
        }),
      );
    });
  });

  describe("remove", () => {
    it("should soft delete preset successfully", async () => {
      // Arrange
      const presetId = 1;
      repository.findOne.mockResolvedValue({ ...mockPresetEntity });
      repository.save.mockResolvedValue({
        ...mockPresetEntity,
        deleted: 1,
      } as PresetEntity);

      // Act
      await service.remove(presetId);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: presetId, deleted: 0 },
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ deleted: 1 }),
      );
    });

    it("should throw NotFoundException when preset not found", async () => {
      // Arrange
      const presetId = 999;
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(presetId)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("findActivePresets", () => {
    it("should return all active presets", async () => {
      // Arrange
      const activePresets = [mockPresetEntity];
      repository.find.mockResolvedValue(activePresets);

      // Act
      const result = await service.findActivePresets();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        isActive: true,
        displayName: mockPresetEntity.name,
      });
      expect(repository.find).toHaveBeenCalledWith({
        where: { deleted: 0 },
        order: { sequence: "ASC", name: "ASC" },
      });
    });

    it("should return empty array when no active presets", async () => {
      // Arrange
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findActivePresets();

      // Assert
      expect(result).toEqual([]);
    });

    it("should return presets sorted by sequence and name", async () => {
      // Arrange
      const presets = [
        { ...mockPresetEntity, sequence: 2, name: "B Preset" },
        { ...mockPresetEntity, sequence: 1, name: "A Preset" },
      ];
      repository.find.mockResolvedValue(presets as PresetEntity[]);

      // Act
      const result = await service.findActivePresets();

      // Assert
      expect(result).toHaveLength(2);
      expect(repository.find).toHaveBeenCalledWith({
        where: { deleted: 0 },
        order: { sequence: "ASC", name: "ASC" },
      });
    });

    it("should exclude deleted presets", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockPresetEntity]);

      // Act
      await service.findActivePresets();

      // Assert
      expect(repository.find).toHaveBeenCalledWith({
        where: { deleted: 0 },
        order: { sequence: "ASC", name: "ASC" },
      });
    });
  });
});
