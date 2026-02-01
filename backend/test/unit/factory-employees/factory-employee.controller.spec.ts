import { Test, TestingModule } from "@nestjs/testing";
import { FactoryEmployeeController } from "../../../src/factory-employees/factory-employee.controller";
import { FactoryEmployeeService } from "../../../src/factory-employees/factory-employee.service";
import { FactoryEmployee } from "../../../src/factory-employees/domain/factory-employee";
import { FactoryEmployeeId } from "../../../src/factory-employees/domain/value-objects/factory-employee-id.value-object";

// Mock the mapper module
jest.mock(
  "../../../src/factory-employees/mappers/factory-employee-dto.mapper",
  () => ({
    FactoryEmployeeDtoMapper: {
      toDto: jest.fn().mockImplementation((entity) =>
        entity
          ? {
              id: entity.id.value,
              factoryId: entity.factoryId,
              name: entity.name,
            }
          : null,
      ),
      toDtoArray: jest.fn().mockImplementation((entities) =>
        entities.map((e) => ({
          id: e.id.value,
          factoryId: e.factoryId,
          name: e.name,
        })),
      ),
      mapPaginationParams: jest.fn().mockReturnValue({ limit: 20, offset: 0 }),
      fromUpdateDto: jest.fn().mockImplementation((dto) => dto),
    },
  }),
);

describe("FactoryEmployeeController", () => {
  let controller: FactoryEmployeeController;
  let service: jest.Mocked<FactoryEmployeeService>;

  const mockFactoryEmployeeId = FactoryEmployeeId.fromNumber(1);
  const mockFactoryEmployee = new FactoryEmployee(
    mockFactoryEmployeeId,
    100,
    "John Doe",
  );

  const mockDto = {
    id: 1,
    factoryId: 100,
    name: "John Doe",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FactoryEmployeeController],
      providers: [
        {
          provide: FactoryEmployeeService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByFactoryId: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            getEmployeeCountByFactory: jest.fn(),
            bulkTransferToFactory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FactoryEmployeeController>(
      FactoryEmployeeController,
    );
    service = module.get(FactoryEmployeeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new factory employee", async () => {
      // Arrange
      const createDto = {
        factoryId: 100,
        name: "John Doe",
      };
      service.create.mockResolvedValue(mockFactoryEmployee);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockDto);
    });

    it("should throw error when mapper fails", async () => {
      // Arrange
      const createDto = {
        factoryId: 100,
        name: "John Doe",
      };
      service.create.mockResolvedValue(null as any);

      // Act & Assert
      await expect(controller.create(createDto)).rejects.toThrow(
        "Failed to map factory employee to DTO",
      );
    });
  });

  describe("findAll", () => {
    it("should return paginated factory employees", async () => {
      // Arrange
      const query = { page: 1, limit: 20 };
      const serviceResult = {
        data: [mockFactoryEmployee],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      service.findAll.mockResolvedValue(serviceResult);

      // Act
      const result = await controller.findAll(query);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it("should filter by factoryId", async () => {
      // Arrange
      const query = { factoryId: 100, page: 1, limit: 20 };
      const serviceResult = {
        data: [mockFactoryEmployee],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      service.findAll.mockResolvedValue(serviceResult);

      // Act
      const result = await controller.findAll(query);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toHaveLength(1);
    });

    it("should return empty data when no employees found", async () => {
      // Arrange
      const query = { page: 1, limit: 20 };
      const serviceResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
      service.findAll.mockResolvedValue(serviceResult);

      // Act
      const result = await controller.findAll(query);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe("findOne", () => {
    it("should return a factory employee by id", async () => {
      // Arrange
      service.findOne.mockResolvedValue(mockFactoryEmployee);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDto);
    });

    it("should throw error when mapper fails", async () => {
      // Arrange
      service.findOne.mockResolvedValue(null as any);

      // Act & Assert
      await expect(controller.findOne(1)).rejects.toThrow(
        "Failed to map factory employee to DTO",
      );
    });
  });

  describe("findByFactory", () => {
    it("should return employees by factory id", async () => {
      // Arrange
      service.findByFactoryId.mockResolvedValue([mockFactoryEmployee]);

      // Act
      const result = await controller.findByFactory(100);

      // Assert
      expect(service.findByFactoryId).toHaveBeenCalledWith(100);
      expect(result).toHaveLength(1);
      expect(result[0].factoryId).toBe(100);
    });

    it("should return empty array when no employees found", async () => {
      // Arrange
      service.findByFactoryId.mockResolvedValue([]);

      // Act
      const result = await controller.findByFactory(100);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("should update a factory employee", async () => {
      // Arrange
      const updateDto = { name: "Jane Doe" };
      const updatedEmployee = new FactoryEmployee(
        mockFactoryEmployeeId,
        100,
        "Jane Doe",
      );
      service.update.mockResolvedValue(updatedEmployee);

      // Act
      const result = await controller.update(1, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.name).toBe("Jane Doe");
    });

    it("should throw error when mapper fails", async () => {
      // Arrange
      const updateDto = { name: "Jane Doe" };
      service.update.mockResolvedValue(null as any);

      // Act & Assert
      await expect(controller.update(1, updateDto)).rejects.toThrow(
        "Failed to map factory employee to DTO",
      );
    });
  });

  describe("remove", () => {
    it("should remove a factory employee", async () => {
      // Arrange
      service.remove.mockResolvedValue(undefined);

      // Act
      await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe("getEmployeeCountByFactory", () => {
    it("should return employee count by factory", async () => {
      // Arrange
      service.getEmployeeCountByFactory.mockResolvedValue(5);

      // Act
      const result = await controller.getEmployeeCountByFactory(100);

      // Assert
      expect(service.getEmployeeCountByFactory).toHaveBeenCalledWith(100);
      expect(result).toEqual({ factoryId: 100, count: 5 });
    });

    it("should return 0 when no employees in factory", async () => {
      // Arrange
      service.getEmployeeCountByFactory.mockResolvedValue(0);

      // Act
      const result = await controller.getEmployeeCountByFactory(100);

      // Assert
      expect(result).toEqual({ factoryId: 100, count: 0 });
    });
  });

  describe("bulkTransfer", () => {
    it("should transfer multiple employees to new factory", async () => {
      // Arrange
      const body = {
        employeeIds: [1, 2, 3],
        newFactoryId: 200,
      };
      const transferredEmployees = [
        mockFactoryEmployee,
        new FactoryEmployee(FactoryEmployeeId.fromNumber(2), 200, "Jane Doe"),
        new FactoryEmployee(FactoryEmployeeId.fromNumber(3), 200, "Bob Smith"),
      ];
      service.bulkTransferToFactory.mockResolvedValue(transferredEmployees);

      // Act
      const result = await controller.bulkTransfer(body);

      // Assert
      expect(service.bulkTransferToFactory).toHaveBeenCalledWith(
        [1, 2, 3],
        200,
      );
      expect(result).toHaveLength(3);
    });

    it("should return empty array when no employees transferred", async () => {
      // Arrange
      const body = {
        employeeIds: [1, 2],
        newFactoryId: 200,
      };
      service.bulkTransferToFactory.mockResolvedValue([]);

      // Act
      const result = await controller.bulkTransfer(body);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
