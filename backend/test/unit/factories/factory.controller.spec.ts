import { Test, TestingModule } from "@nestjs/testing";
import { FactoryController } from "../../../src/factories/factory.controller";
import { FactoryService } from "../../../src/factories/factory.service";
import { FactoryDto } from "../../../src/factories/dto/factory.dto";
import { CreateFactoryDto } from "../../../src/factories/dto/create-factory.dto";
import { UpdateFactoryDto } from "../../../src/factories/dto/update-factory.dto";

describe("FactoryController", () => {
  let controller: FactoryController;
  let service: jest.Mocked<FactoryService>;

  const mockFactoryDto: FactoryDto = {
    id: 1,
    userId: 200,
    address: "456 Factory Rd",
    zipcode: "54321",
    state: "New York",
    city: "New York",
    country: "United States",
    phoneNo: "555-4321",
    cellNo: "555-8765",
    currency: 1,
    emailaddress: "factory@example.com",
    deleted: 0,
    isActive: true,
    fullAddress: "456 Factory Rd, New York, New York, 54321, United States",
    displayName: "Factory Owner",
    username: "factoryowner",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FactoryController],
      providers: [
        {
          provide: FactoryService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findActiveFactories: jest.fn(),
            findByCountry: jest.fn(),
            findByCity: jest.fn(),
            getCountByCountry: jest.fn(),
            getActiveCount: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FactoryController>(FactoryController);
    service = module.get(FactoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new factory", async () => {
      // Arrange
      const createDto: CreateFactoryDto = {
        userId: 200,
        city: "New York",
        country: "United States",
      };
      service.create.mockResolvedValue(mockFactoryDto);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockFactoryDto);
    });
  });

  describe("findAll", () => {
    it("should return paginated factories", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockFactoryDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(paginatedResult);
    });

    it("should pass pagination parameters", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockFactoryDto],
        total: 20,
        pages: 4,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      const result = await controller.findAll(3, 5);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(3, 5, undefined, undefined);
      expect(result.pages).toBe(4);
    });

    it("should pass filter parameters", async () => {
      // Arrange
      const paginatedResult = {
        data: [mockFactoryDto],
        total: 1,
        pages: 1,
      };
      service.findAll.mockResolvedValue(paginatedResult);

      // Act
      await controller.findAll(1, 10, "New York", "United States");

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(
        1,
        10,
        "New York",
        "United States",
      );
    });
  });

  describe("findActive", () => {
    it("should return active factories", async () => {
      // Arrange
      service.findActiveFactories.mockResolvedValue([mockFactoryDto]);

      // Act
      const result = await controller.findActive();

      // Assert
      expect(service.findActiveFactories).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });

    it("should return empty array when no active factories", async () => {
      // Arrange
      service.findActiveFactories.mockResolvedValue([]);

      // Act
      const result = await controller.findActive();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByCountry", () => {
    it("should return factories by country", async () => {
      // Arrange
      service.findByCountry.mockResolvedValue([mockFactoryDto]);

      // Act
      const result = await controller.findByCountry("United States");

      // Assert
      expect(service.findByCountry).toHaveBeenCalledWith("United States");
      expect(result).toHaveLength(1);
      expect(result[0].country).toBe("United States");
    });

    it("should return empty array when no factories in country", async () => {
      // Arrange
      service.findByCountry.mockResolvedValue([]);

      // Act
      const result = await controller.findByCountry("Canada");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByCity", () => {
    it("should return factories by city", async () => {
      // Arrange
      service.findByCity.mockResolvedValue([mockFactoryDto]);

      // Act
      const result = await controller.findByCity("New York");

      // Assert
      expect(service.findByCity).toHaveBeenCalledWith("New York");
      expect(result).toHaveLength(1);
      expect(result[0].city).toBe("New York");
    });

    it("should return empty array when no factories in city", async () => {
      // Arrange
      service.findByCity.mockResolvedValue([]);

      // Act
      const result = await controller.findByCity("Boston");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getCountByCountry", () => {
    it("should return factory count by country", async () => {
      // Arrange
      service.getCountByCountry.mockResolvedValue(8);

      // Act
      const result = await controller.getCountByCountry("United States");

      // Assert
      expect(service.getCountByCountry).toHaveBeenCalledWith("United States");
      expect(result).toEqual({ count: 8 });
    });

    it("should return 0 when no factories in country", async () => {
      // Arrange
      service.getCountByCountry.mockResolvedValue(0);

      // Act
      const result = await controller.getCountByCountry("Canada");

      // Assert
      expect(result).toEqual({ count: 0 });
    });
  });

  describe("getActiveCount", () => {
    it("should return active factory count", async () => {
      // Arrange
      service.getActiveCount.mockResolvedValue(15);

      // Act
      const result = await controller.getActiveCount();

      // Assert
      expect(service.getActiveCount).toHaveBeenCalled();
      expect(result).toEqual({ count: 15 });
    });

    it("should return 0 when no active factories", async () => {
      // Arrange
      service.getActiveCount.mockResolvedValue(0);

      // Act
      const result = await controller.getActiveCount();

      // Assert
      expect(result).toEqual({ count: 0 });
    });
  });

  describe("findOne", () => {
    it("should return a factory by id", async () => {
      // Arrange
      service.findOne.mockResolvedValue(mockFactoryDto);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockFactoryDto);
    });
  });

  describe("update", () => {
    it("should update a factory", async () => {
      // Arrange
      const updateDto: UpdateFactoryDto = {
        city: "Buffalo",
      };
      const updatedFactory = { ...mockFactoryDto, city: "Buffalo" };
      service.update.mockResolvedValue(updatedFactory);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.city).toBe("Buffalo");
    });
  });

  describe("remove", () => {
    it("should remove a factory", async () => {
      // Arrange
      service.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
