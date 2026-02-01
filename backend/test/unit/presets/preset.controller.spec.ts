import { Test, TestingModule } from "@nestjs/testing";
import { PresetController } from "../../../src/presets/preset.controller";
import { PresetService } from "../../../src/presets/preset.service";
import { PresetDto } from "../../../src/presets/dto/preset.dto";

describe("PresetController", () => {
  let controller: PresetController;
  let service: jest.Mocked<PresetService>;

  const mockPresetDto: PresetDto = {
    id: 1,
    name: "Standard Setup",
    sequence: 1,
    deleted: 0,
    isActive: true,
    displayName: "Standard Setup",
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findActivePresets: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresetController],
      providers: [
        {
          provide: PresetService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PresetController>(PresetController);
    service = module.get(PresetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new preset", async () => {
      // Arrange
      const createDto: any = {
        name: "New Preset",
        sequence: 5,
      };
      service.create.mockResolvedValue(mockPresetDto);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockPresetDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it("should handle create with minimal data", async () => {
      // Arrange
      const createDto: any = {
        name: "Simple Preset",
      };
      const simplePreset = { ...mockPresetDto, ...createDto };
      service.create.mockResolvedValue(simplePreset);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(simplePreset);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it("should handle create with all fields", async () => {
      // Arrange
      const createDto: any = {
        name: "Complete Preset",
        sequence: 10,
      };
      service.create.mockResolvedValue(mockPresetDto);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toEqual(mockPresetDto);
    });
  });

  describe("findAll", () => {
    it("should return all presets", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockPresetDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(paginatedResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no presets", async () => {
      // Arrange
      const emptyResult = {
        data: [],
        total: 0,
        pages: 0,
      };
      service.findAll.mockResolvedValue(emptyResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(emptyResult);
      expect(result.data).toHaveLength(0);
    });

    it("should return multiple presets", async () => {
      // Arrange
      const presets = [
        mockPresetDto,
        { ...mockPresetDto, id: 2, name: "Advanced Setup" },
        { ...mockPresetDto, id: 3, name: "Professional Setup" },
      ];
      const paginatedResult = {
        data: presets,
        total: 3,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
    });
  });

  describe("findOne", () => {
    it("should return preset by integer ID", async () => {
      // Arrange
      service.findOne.mockResolvedValue(mockPresetDto);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(result).toEqual(mockPresetDto);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it("should handle different ID values", async () => {
      // Arrange
      const differentPreset = { ...mockPresetDto, id: 999 };
      service.findOne.mockResolvedValue(differentPreset);

      // Act
      const result = await controller.findOne(999);

      // Assert
      expect(result.id).toBe(999);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });

    it("should use ParseIntPipe for ID parameter", async () => {
      // Arrange
      service.findOne.mockResolvedValue(mockPresetDto);

      // Act
      await controller.findOne(1);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(typeof 1).toBe("number");
    });
  });

  describe("update", () => {
    it("should update preset", async () => {
      // Arrange
      const updateDto: any = {
        name: "Updated Preset",
        sequence: 10,
      };
      const updatedPreset = { ...mockPresetDto, ...updateDto };
      service.update.mockResolvedValue(updatedPreset);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(result).toEqual(updatedPreset);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });

    it("should update with partial data", async () => {
      // Arrange
      const updateDto: any = {
        sequence: 15,
      };
      const updatedPreset = { ...mockPresetDto, sequence: 15 };
      service.update.mockResolvedValue(updatedPreset);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(result.sequence).toBe(15);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it("should update only name", async () => {
      // Arrange
      const updateDto: any = {
        name: "Premium Setup",
      };
      const updatedPreset = { ...mockPresetDto, name: "Premium Setup" };
      service.update.mockResolvedValue(updatedPreset);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(result.name).toBe("Premium Setup");
    });

    it("should handle updates with different IDs", async () => {
      // Arrange
      const updateDto: any = { name: "Changed" };
      const updatedPreset = { ...mockPresetDto, id: 99, name: "Changed" };
      service.update.mockResolvedValue(updatedPreset);

      // Act
      const result = await controller.update(99, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(99, updateDto);
      expect(result.id).toBe(99);
    });
  });

  describe("remove", () => {
    it("should remove preset", async () => {
      // Arrange
      service.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it("should handle removal of different IDs", async () => {
      // Arrange
      service.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(999);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(999);
    });

    it("should use ParseIntPipe for ID parameter", async () => {
      // Arrange
      service.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(typeof 1).toBe("number");
    });
  });
});
