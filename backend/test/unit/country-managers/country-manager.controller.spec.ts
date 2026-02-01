import { Test, TestingModule } from "@nestjs/testing";
import { CountryManagerController } from "../../../src/country-managers/country-manager.controller";
import { CountryManagerService } from "../../../src/country-managers/country-manager.service";
import { CountryManagerDto } from "../../../src/country-managers/dto/country-manager.dto";
import { CreateCountryManagerDto } from "../../../src/country-managers/dto/create-country-manager.dto";
import { UpdateCountryManagerDto } from "../../../src/country-managers/dto/update-country-manager.dto";
import { QueryCountryManagerDto } from "../../../src/country-managers/dto/query-country-manager.dto";

describe("CountryManagerController", () => {
  let controller: CountryManagerController;
  let service: jest.Mocked<CountryManagerService>;

  const mockCountryManagerDto: CountryManagerDto = {
    id: "1",
    userId: "100",
    country: "United Kingdom",
    region: "Scotland",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    deletedAt: undefined,
    createdBy: undefined,
    updatedBy: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountryManagerController],
      providers: [
        {
          provide: CountryManagerService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByCountry: jest.fn(),
            findByRegion: jest.fn(),
            findActive: jest.fn(),
            getCountryManagerStatistics: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CountryManagerController>(CountryManagerController);
    service = module.get(CountryManagerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new country manager", async () => {
      // Arrange
      const createDto: CreateCountryManagerDto = {
        userId: 100,
        country: "United Kingdom",
        region: "Scotland",
        isActive: true,
      };
      service.create.mockResolvedValue(mockCountryManagerDto);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCountryManagerDto);
    });
  });

  describe("findAll", () => {
    it("should return all country managers", async () => {
      // Arrange
      const query = new QueryCountryManagerDto();
      service.findAll.mockResolvedValue([mockCountryManagerDto]);

      // Act
      const result = await controller.findAll(query);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCountryManagerDto);
    });

    it("should return empty array when no country managers found", async () => {
      // Arrange
      const query = new QueryCountryManagerDto();
      service.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll(query);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findActive", () => {
    it("should return active country managers", async () => {
      // Arrange
      service.findActive.mockResolvedValue([mockCountryManagerDto]);

      // Act
      const result = await controller.findActive();

      // Assert
      expect(service.findActive).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });

    it("should return empty array when no active country managers", async () => {
      // Arrange
      service.findActive.mockResolvedValue([]);

      // Act
      const result = await controller.findActive();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getCountryManagerStatistics", () => {
    it("should return country manager statistics", async () => {
      // Arrange
      const stats = {
        total: 10,
        active: 7,
        inactive: 3,
      };
      service.getCountryManagerStatistics.mockResolvedValue(stats);

      // Act
      const result = await controller.getCountryManagerStatistics();

      // Assert
      expect(service.getCountryManagerStatistics).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });

    it("should return zeros when no country managers exist", async () => {
      // Arrange
      const stats = {
        total: 0,
        active: 0,
        inactive: 0,
      };
      service.getCountryManagerStatistics.mockResolvedValue(stats);

      // Act
      const result = await controller.getCountryManagerStatistics();

      // Assert
      expect(result).toEqual(stats);
    });
  });

  describe("findByCountry", () => {
    it("should return country managers by country", async () => {
      // Arrange
      service.findByCountry.mockResolvedValue([mockCountryManagerDto]);

      // Act
      const result = await controller.findByCountry("United Kingdom");

      // Assert
      expect(service.findByCountry).toHaveBeenCalledWith("United Kingdom");
      expect(result).toHaveLength(1);
      expect(result[0].country).toBe("United Kingdom");
    });

    it("should return empty array when no country managers in country", async () => {
      // Arrange
      service.findByCountry.mockResolvedValue([]);

      // Act
      const result = await controller.findByCountry("France");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByRegion", () => {
    it("should return country managers by region", async () => {
      // Arrange
      service.findByRegion.mockResolvedValue([mockCountryManagerDto]);

      // Act
      const result = await controller.findByRegion("Scotland");

      // Assert
      expect(service.findByRegion).toHaveBeenCalledWith("Scotland");
      expect(result).toHaveLength(1);
      expect(result[0].region).toBe("Scotland");
    });

    it("should return empty array when no country managers in region", async () => {
      // Arrange
      service.findByRegion.mockResolvedValue([]);

      // Act
      const result = await controller.findByRegion("Wales");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a country manager by id", async () => {
      // Arrange
      service.findOne.mockResolvedValue(mockCountryManagerDto);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCountryManagerDto);
    });
  });

  describe("update", () => {
    it("should update a country manager", async () => {
      // Arrange
      const updateDto: UpdateCountryManagerDto = {
        region: "England",
        isActive: false,
      };
      const updatedDto = {
        ...mockCountryManagerDto,
        region: "England",
        isActive: false,
      };
      service.update.mockResolvedValue(updatedDto);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.region).toBe("England");
      expect(result.isActive).toBe(false);
    });
  });

  describe("remove", () => {
    it("should remove a country manager", async () => {
      // Arrange
      service.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
