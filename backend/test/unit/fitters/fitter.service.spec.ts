import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { FitterService } from "../../../src/fitters/fitter.service";
import { FitterEntity } from "../../../src/fitters/infrastructure/persistence/relational/entities/fitter.entity";
import { UserEntity } from "../../../src/users/infrastructure/persistence/relational/entities/user.entity";
import { Repository } from "typeorm";

describe("FitterService", () => {
  let service: FitterService;
  let repository: jest.Mocked<Repository<FitterEntity>>;

  const mockFitterEntity: FitterEntity = {
    id: 1,
    userId: 100,
    address: "123 Main St",
    zipcode: "12345",
    state: "California",
    city: "Los Angeles",
    country: "United States",
    phoneNo: "555-1234",
    cellNo: "555-5678",
    currency: 1,
    emailaddress: "fitter@example.com",
    deleted: 0,
    get isActive() {
      return this.deleted === 0;
    },
    get fullAddress() {
      const parts = [
        this.address,
        this.city,
        this.state,
        this.zipcode,
        this.country,
      ].filter((part) => part && part.trim() !== "");
      return parts.join(", ");
    },
    get displayName() {
      return this.city ? `Fitter in ${this.city}` : `Fitter #${this.id}`;
    },
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(1),
    getMany: jest.fn().mockResolvedValue([mockFitterEntity]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FitterService,
        {
          provide: getRepositoryToken(FitterEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FitterService>(FitterService);
    repository = module.get(getRepositoryToken(FitterEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new fitter successfully", async () => {
      // Arrange
      const createDto = {
        userId: 100,
        address: "123 Main St",
        city: "Los Angeles",
        country: "United States",
      };
      repository.create.mockReturnValue(mockFitterEntity);
      repository.save.mockResolvedValue(mockFitterEntity);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith({
        userId: createDto.userId,
        address: createDto.address,
        zipcode: null,
        state: null,
        city: createDto.city,
        country: createDto.country,
        phoneNo: null,
        cellNo: null,
        currency: null,
        emailaddress: null,
        deleted: 0,
      });
      expect(repository.save).toHaveBeenCalledWith(mockFitterEntity);
      expect(result.id).toBe(1);
      expect(result.city).toBe("Los Angeles");
    });

    it("should create fitter with all fields", async () => {
      // Arrange
      const createDto = {
        userId: 100,
        address: "123 Main St",
        zipcode: "12345",
        state: "California",
        city: "Los Angeles",
        country: "United States",
        phoneNo: "555-1234",
        cellNo: "555-5678",
        currency: 1,
        emailaddress: "fitter@example.com",
      };
      repository.create.mockReturnValue(mockFitterEntity);
      repository.save.mockResolvedValue(mockFitterEntity);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(repository.save).toHaveBeenCalled();
      expect(result.emailaddress).toBe("fitter@example.com");
    });
  });

  describe("findOne", () => {
    it("should find a fitter by id", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockFitterEntity);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, deleted: 0 },
      });
      expect(result.id).toBe(1);
      expect(result.city).toBe("Los Angeles");
    });

    it("should throw NotFoundException when fitter not found", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow("Fitter not found");
    });
  });

  describe("findAll", () => {
    it("should find all fitters with pagination", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockFitterEntity]);

      // Act
      const result = await service.findAll(1, 10);

      // Assert
      expect(repository.createQueryBuilder).toHaveBeenCalledWith("fitter");
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("fitter.deleted = 0");
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        "fitter.city",
        "ASC",
      );
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.pages).toBe(1);
    });

    it("should filter by city", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockFitterEntity]);

      // Act
      const result = await service.findAll(1, 10, "Los Angeles");

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "fitter.city ILIKE :city",
        { city: "%Los Angeles%" },
      );
      expect(result.data).toHaveLength(1);
    });

    it("should filter by country", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockFitterEntity]);

      // Act
      const result = await service.findAll(1, 10, undefined, "United States");

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "fitter.country ILIKE :country",
        { country: "%United States%" },
      );
      expect(result.data).toHaveLength(1);
    });

    it("should filter by both city and country", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockFitterEntity]);

      // Act
      const result = await service.findAll(
        1,
        10,
        "Los Angeles",
        "United States",
      );

      // Assert
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(result.data).toHaveLength(1);
    });

    it("should handle pagination correctly", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(25);
      mockQueryBuilder.getMany.mockResolvedValue([mockFitterEntity]);

      // Act
      const result = await service.findAll(2, 10);

      // Assert
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.pages).toBe(3);
    });
  });

  describe("update", () => {
    it("should update a fitter successfully", async () => {
      // Arrange
      const updateDto = {
        city: "San Francisco",
        state: "California",
      };
      const updatedFitter = {
        ...mockFitterEntity,
        ...updateDto,
        get isActive() {
          return this.deleted === 0;
        },
        get fullAddress() {
          const parts = [
            this.address,
            this.city,
            this.state,
            this.zipcode,
            this.country,
          ].filter((part) => part && part.trim() !== "");
          return parts.join(", ");
        },
        get displayName() {
          return this.city ? `Fitter in ${this.city}` : `Fitter #${this.id}`;
        },
      };
      repository.findOne.mockResolvedValue(mockFitterEntity);
      repository.save.mockResolvedValue(updatedFitter as any);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, deleted: 0 },
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result.city).toBe("San Francisco");
    });

    it("should update only provided fields", async () => {
      // Arrange
      const updateDto = { phoneNo: "555-9999" };
      const updatedEntity = {
        ...mockFitterEntity,
        phoneNo: "555-9999",
        city: "Los Angeles",
      };
      repository.findOne.mockResolvedValue(mockFitterEntity);
      repository.save.mockResolvedValue(updatedEntity as any);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(result.phoneNo).toBe("555-9999");
      expect(result.city).toBe("Los Angeles");
    });

    it("should throw NotFoundException when fitter not found", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, { city: "New York" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should soft delete a fitter", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockFitterEntity);
      repository.save.mockResolvedValue({
        ...mockFitterEntity,
        deleted: 1,
      } as any);

      // Act
      await service.remove(1);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, deleted: 0 },
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when fitter not found", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByUserId", () => {
    it("should find fitter by user id", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockFitterEntity);

      // Act
      const result = await service.findByUserId(100);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { userId: 100, deleted: 0 },
      });
      expect(result).toBeDefined();
      expect(result!.userId).toBe(100);
    });

    it("should return null when fitter not found", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByUserId(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findActiveFitters", () => {
    it("should find all active fitters", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockFitterEntity]);

      // Act
      const result = await service.findActiveFitters();

      // Assert
      expect(repository.find).toHaveBeenCalledWith({
        where: { deleted: 0 },
        order: { city: "ASC" },
      });
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no active fitters", async () => {
      // Arrange
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.findActiveFitters();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByCountry", () => {
    it("should find fitters by country", async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([mockFitterEntity]);

      // Act
      const result = await service.findByCountry("United States");

      // Assert
      expect(repository.createQueryBuilder).toHaveBeenCalledWith("fitter");
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("fitter.deleted = 0");
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "fitter.country ILIKE :country",
        { country: "%United States%" },
      );
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no fitters in country", async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      const result = await service.findByCountry("Canada");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("findByCity", () => {
    it("should find fitters by city", async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([mockFitterEntity]);

      // Act
      const result = await service.findByCity("Los Angeles");

      // Assert
      expect(repository.createQueryBuilder).toHaveBeenCalledWith("fitter");
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("fitter.deleted = 0");
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "fitter.city ILIKE :city",
        { city: "%Los Angeles%" },
      );
      expect(result).toHaveLength(1);
    });

    it("should return empty array when no fitters in city", async () => {
      // Arrange
      mockQueryBuilder.getMany.mockResolvedValue([]);

      // Act
      const result = await service.findByCity("New York");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getCountByCountry", () => {
    it("should return count of fitters by country", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(5);

      // Act
      const result = await service.getCountByCountry("United States");

      // Assert
      expect(repository.createQueryBuilder).toHaveBeenCalledWith("fitter");
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("fitter.deleted = 0");
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "fitter.country ILIKE :country",
        { country: "%United States%" },
      );
      expect(result).toBe(5);
    });

    it("should return 0 when no fitters in country", async () => {
      // Arrange
      mockQueryBuilder.getCount.mockResolvedValue(0);

      // Act
      const result = await service.getCountByCountry("Canada");

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("getActiveCount", () => {
    it("should return count of active fitters", async () => {
      // Arrange
      repository.count.mockResolvedValue(10);

      // Act
      const result = await service.getActiveCount();

      // Assert
      expect(repository.count).toHaveBeenCalledWith({
        where: { deleted: 0 },
      });
      expect(result).toBe(10);
    });

    it("should return 0 when no active fitters", async () => {
      // Arrange
      repository.count.mockResolvedValue(0);

      // Act
      const result = await service.getActiveCount();

      // Assert
      expect(result).toBe(0);
    });
  });
});
