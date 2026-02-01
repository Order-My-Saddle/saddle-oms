import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { CountryManagerService } from "../../../src/country-managers/country-manager.service";
import { CountryManagerRepository } from "../../../src/country-managers/infrastructure/persistence/relational/repositories/country-manager.repository";

describe("CountryManagerService", () => {
  let service: CountryManagerService;
  let repository: jest.Mocked<CountryManagerRepository>;

  const mockCountryManagerEntity = {
    id: 1,
    userId: 100,
    country: "United Kingdom",
    region: "Scotland",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: undefined,
    createdBy: undefined,
    updatedBy: undefined,
    user: {} as any,
    get displayInfo() {
      return `${this.country}${this.region ? ` (${this.region})` : ""}`;
    },
    get effectivelyDeleted() {
      return this.deletedAt !== null && this.deletedAt !== undefined;
    },
  } as any;

  const mockQueryDto = {
    getCountryManagerFilters: jest.fn().mockReturnValue({
      country: undefined,
      region: undefined,
      isActive: undefined,
    }),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findByUserId: jest.fn(),
      findByCountry: jest.fn(),
      findByRegion: jest.fn(),
      findActive: jest.fn(),
      count: jest.fn(),
      countActive: jest.fn(),
      countInactive: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryManagerService,
        {
          provide: CountryManagerRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CountryManagerService>(CountryManagerService);
    repository = module.get(CountryManagerRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new country manager successfully", async () => {
      // Arrange
      const createDto = {
        userId: 100,
        country: "United Kingdom",
        region: "Scotland",
        isActive: true,
      };
      repository.findByUserId.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockCountryManagerEntity);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(repository.findByUserId).toHaveBeenCalledWith(100);
      expect(repository.create).toHaveBeenCalledWith({
        userId: 100,
        country: "United Kingdom",
        region: "Scotland",
        isActive: true,
      });
      expect(result.userId).toBe(100);
      expect(result.country).toBe("United Kingdom");
    });

    it("should create country manager with default isActive true", async () => {
      // Arrange
      const createDto = {
        userId: 100,
        country: "United Kingdom",
        region: "Scotland",
      };
      repository.findByUserId.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockCountryManagerEntity);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith({
        userId: 100,
        country: "United Kingdom",
        region: "Scotland",
        isActive: true,
      });
      expect(result.isActive).toBe(true);
    });

    it("should throw ConflictException when user already has country manager", async () => {
      // Arrange
      const createDto = {
        userId: 100,
        country: "United Kingdom",
        region: "Scotland",
      };
      repository.findByUserId.mockResolvedValue(mockCountryManagerEntity);

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        "Country manager with this user ID already exists",
      );
    });
  });

  describe("findOne", () => {
    it("should find a country manager by id", async () => {
      // Arrange
      repository.findById.mockResolvedValue(mockCountryManagerEntity);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
      expect(result.country).toBe("United Kingdom");
    });

    it("should throw NotFoundException when country manager not found", async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        "Country manager not found",
      );
    });
  });

  describe("findAll", () => {
    it("should find all country managers", async () => {
      // Arrange
      repository.findAll.mockResolvedValue([mockCountryManagerEntity]);

      // Act
      const result = await service.findAll(mockQueryDto as any);

      // Assert
      expect(mockQueryDto.getCountryManagerFilters).toHaveBeenCalled();
      expect(repository.findAll).toHaveBeenCalledWith({
        country: undefined,
        region: undefined,
        isActive: undefined,
      });
      expect(result).toHaveLength(1);
      expect(result[0].country).toBe("United Kingdom");
    });

    it("should filter by country", async () => {
      // Arrange
      const queryDto = {
        getCountryManagerFilters: jest.fn().mockReturnValue({
          country: "United Kingdom",
          region: undefined,
          isActive: undefined,
        }),
      };
      repository.findAll.mockResolvedValue([mockCountryManagerEntity]);

      // Act
      const result = await service.findAll(queryDto as any);

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith({
        country: "United Kingdom",
        region: undefined,
        isActive: undefined,
      });
      expect(result).toHaveLength(1);
    });

    it("should filter by active status", async () => {
      // Arrange
      const queryDto = {
        getCountryManagerFilters: jest.fn().mockReturnValue({
          country: undefined,
          region: undefined,
          isActive: true,
        }),
      };
      repository.findAll.mockResolvedValue([mockCountryManagerEntity]);

      // Act
      const result = await service.findAll(queryDto as any);

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith({
        country: undefined,
        region: undefined,
        isActive: true,
      });
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no country managers found", async () => {
      // Arrange
      repository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.findAll(mockQueryDto as any);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("should update a country manager successfully", async () => {
      // Arrange
      const updateDto = {
        region: "England",
        isActive: false,
      };
      const updatedEntity = {
        ...mockCountryManagerEntity,
        region: "England",
        isActive: false,
      };
      repository.findById.mockResolvedValue(mockCountryManagerEntity);
      repository.update.mockResolvedValue(updatedEntity);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.region).toBe("England");
      expect(result.isActive).toBe(false);
    });

    it("should throw NotFoundException when country manager not found", async () => {
      // Arrange
      const updateDto = { region: "England" };
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw NotFoundException when update returns null", async () => {
      // Arrange
      const updateDto = { region: "England" };
      repository.findById.mockResolvedValue(mockCountryManagerEntity);
      repository.update.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(1, updateDto)).rejects.toThrow(
        "Country manager not found after update",
      );
    });
  });

  describe("remove", () => {
    it("should soft delete a country manager", async () => {
      // Arrange
      repository.findById.mockResolvedValue(mockCountryManagerEntity);
      repository.softDelete.mockResolvedValue(undefined);

      // Act
      await service.remove(1);

      // Assert
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException when country manager not found", async () => {
      // Arrange
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByCountry", () => {
    it("should find country managers by country", async () => {
      // Arrange
      repository.findByCountry.mockResolvedValue([mockCountryManagerEntity]);

      // Act
      const result = await service.findByCountry("United Kingdom");

      // Assert
      expect(repository.findByCountry).toHaveBeenCalledWith("United Kingdom");
      expect(result).toHaveLength(1);
      expect(result[0].country).toBe("United Kingdom");
    });

    it("should return empty array when no country managers in country", async () => {
      // Arrange
      repository.findByCountry.mockResolvedValue([]);

      // Act
      const result = await service.findByCountry("France");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByRegion", () => {
    it("should find country managers by region", async () => {
      // Arrange
      repository.findByRegion.mockResolvedValue([mockCountryManagerEntity]);

      // Act
      const result = await service.findByRegion("Scotland");

      // Assert
      expect(repository.findByRegion).toHaveBeenCalledWith("Scotland");
      expect(result).toHaveLength(1);
      expect(result[0].region).toBe("Scotland");
    });

    it("should return empty array when no country managers in region", async () => {
      // Arrange
      repository.findByRegion.mockResolvedValue([]);

      // Act
      const result = await service.findByRegion("Wales");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findActive", () => {
    it("should find all active country managers", async () => {
      // Arrange
      repository.findActive.mockResolvedValue([mockCountryManagerEntity]);

      // Act
      const result = await service.findActive();

      // Assert
      expect(repository.findActive).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });

    it("should return empty array when no active country managers", async () => {
      // Arrange
      repository.findActive.mockResolvedValue([]);

      // Act
      const result = await service.findActive();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getCountryManagerStatistics", () => {
    it("should return country manager statistics", async () => {
      // Arrange
      repository.count.mockResolvedValue(10);
      repository.countActive.mockResolvedValue(7);
      repository.countInactive.mockResolvedValue(3);

      // Act
      const result = await service.getCountryManagerStatistics();

      // Assert
      expect(repository.count).toHaveBeenCalled();
      expect(repository.countActive).toHaveBeenCalled();
      expect(repository.countInactive).toHaveBeenCalled();
      expect(result).toEqual({
        total: 10,
        active: 7,
        inactive: 3,
      });
    });

    it("should return zeros when no country managers exist", async () => {
      // Arrange
      repository.count.mockResolvedValue(0);
      repository.countActive.mockResolvedValue(0);
      repository.countInactive.mockResolvedValue(0);

      // Act
      const result = await service.getCountryManagerStatistics();

      // Assert
      expect(result).toEqual({
        total: 0,
        active: 0,
        inactive: 0,
      });
    });
  });
});
