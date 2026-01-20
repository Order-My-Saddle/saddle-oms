import { Test, TestingModule } from "@nestjs/testing";
import {
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CustomerService } from "../../../src/customers/customer.service";
import { ICustomerRepository } from "../../../src/customers/domain/customer.repository";
import { Customer } from "../../../src/customers/domain/customer";
import { CustomerId } from "../../../src/customers/domain/value-objects/customer-id.value-object";
import { Email } from "../../../src/customers/domain/value-objects/email.value-object";
import { CustomerStatus } from "../../../src/customers/domain/value-objects/customer-status.value-object";
import { CreateCustomerDto } from "../../../src/customers/dto/create-customer.dto";
import { UpdateCustomerDto } from "../../../src/customers/dto/update-customer.dto";
import { QueryCustomerDto } from "../../../src/customers/dto/query-customer.dto";
import { CustomerMapper } from "../../../src/customers/mappers/customer-dto.mapper";

// Mock the static methods
jest.mock(
  "../../../src/customers/domain/value-objects/customer-id.value-object",
);
jest.mock("../../../src/customers/domain/value-objects/email.value-object");
jest.mock(
  "../../../src/customers/domain/value-objects/customer-status.value-object",
);
jest.mock("../../../src/customers/domain/customer");

describe("CustomerService", () => {
  let service: CustomerService;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let customerMapper: jest.Mocked<CustomerMapper>;

  const mockCustomerId = {
    value: "internal-uuid-1001",
    toString: () => "internal-uuid-1001",
    equals: jest.fn(),
  };

  const mockEmail = {
    value: "customer@example.com",
    toString: () => "customer@example.com",
  };

  // Create mock customer using unknown type to bypass TypeScript strict typing
  const createMockCustomer = (overrides = {}) =>
    ({
      id: mockCustomerId,
      email: mockEmail,
      name: "John Doe",
      address: "123 Main Street",
      city: "New York",
      country: "USA",
      fitterId: 2001,
      status: CustomerStatus.ACTIVE,
      legacyId: 12345,
      legacyFitterId: 67890,
      createdAt: new Date(),
      updatedAt: new Date(),
      updateContactInfo: jest.fn(),
      assignFitter: jest.fn(),
      removeFitter: jest.fn(),
      unassignFitter: jest.fn(),
      changeStatus: jest.fn(),
      deactivate: jest.fn(),
      reactivate: jest.fn(),
      isActive: jest.fn().mockReturnValue(true),
      hasFitter: jest.fn().mockReturnValue(true),
      validateForOrder: jest.fn(),
      getDisplayName: jest
        .fn()
        .mockReturnValue("John Doe (customer@example.com)"),
      getUncommittedEvents: jest.fn().mockReturnValue([]),
      markEventsAsCommitted: jest.fn(),
      ...overrides,
    }) as unknown as Customer;

  const mockCustomer = createMockCustomer();

  const mockCustomerDto = {
    id: 1001,
    email: "customer@example.com",
    name: "John Doe",
    address: "123 Main Street",
    city: "New York",
    country: "USA",
    fitterId: 2001,
    status: CustomerStatus.ACTIVE,
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2023-12-01"),
    displayName: "John Doe (customer@example.com)",
    isActive: true,
    hasFitter: true,
  };

  beforeEach(async () => {
    const mockCustomerRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      findByFitterId: jest.fn(),
      findActiveCustomersWithoutFitter: jest.fn(),
      countByFitterId: jest.fn(),
      delete: jest.fn(),
      findByCountry: jest.fn(),
      findByCity: jest.fn(),
      countActive: jest.fn(),
      findActive: jest.fn(),
      bulkCreate: jest.fn(),
    };

    const mockCustomerMapper = {
      toDto: jest.fn(),
      toDomain: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: ICustomerRepository, useValue: mockCustomerRepository },
        { provide: CustomerMapper, useValue: mockCustomerMapper },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    customerRepository = module.get(ICustomerRepository);
    customerMapper = module.get(CustomerMapper);

    // Setup default mocks
    (CustomerId.generate as jest.Mock).mockReturnValue(mockCustomerId);
    (CustomerId.fromString as jest.Mock).mockReturnValue(mockCustomerId);
    (Email.fromString as jest.Mock).mockReturnValue(mockEmail);
    (Customer.create as jest.Mock).mockReturnValue(mockCustomer);
    customerMapper.toDto.mockReturnValue(mockCustomerDto);
    mockCustomerId.equals.mockReturnValue(false); // Default to not equal
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new customer successfully", async () => {
      // Arrange
      const createDto: CreateCustomerDto = {
        email: "customer@example.com",
        name: "John Doe",
        address: "123 Main Street",
        city: "New York",
        country: "USA",
        fitterId: 2001,
      };

      customerRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockCustomerDto);
      expect(CustomerId.generate).toHaveBeenCalled();
      expect(Customer.create).toHaveBeenCalled();
      expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
      expect(customerMapper.toDto).toHaveBeenCalledWith(mockCustomer);
    });

    it("should create customer without fitter", async () => {
      // Arrange
      const createDto: CreateCustomerDto = {
        email: "customer@example.com",
        name: "Jane Smith",
        address: "456 Oak Avenue",
        city: "Los Angeles",
        country: "USA",
        // No fitterId provided
      };

      customerRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toEqual(mockCustomerDto);
      expect(Customer.create).toHaveBeenCalled();
      expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
    });
  });

  describe("findOne", () => {
    it("should return customer by ID", async () => {
      // Arrange
      const customerId = "1001";
      customerRepository.findById.mockResolvedValue(mockCustomer);

      // Act
      const result = await service.findOne(customerId);

      // Assert
      expect(result).toEqual(mockCustomerDto);
      expect(CustomerId.fromString).toHaveBeenCalledWith(customerId);
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomerId);
      expect(customerMapper.toDto).toHaveBeenCalledWith(mockCustomer);
    });

    it("should throw NotFoundException when customer not found", async () => {
      // Arrange
      const customerId = "9999";
      customerRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(customerId)).rejects.toThrow(
        NotFoundException,
      );
      expect(CustomerId.fromString).toHaveBeenCalledWith(customerId);
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomerId);
    });
  });

  describe("findAll", () => {
    it("should return all customers with basic filters", async () => {
      // Arrange
      const queryDto = {
        getCustomerFilters: jest.fn().mockReturnValue({
          fitterId: 2001,
          country: "USA",
          city: "New York",
          active: true,
        }),
      } as unknown as QueryCustomerDto;

      const customers = [mockCustomer];
      customerRepository.findAll.mockResolvedValue(customers);

      // Act
      const result = await service.findAll(queryDto);

      // Assert
      expect(result).toEqual([mockCustomerDto]);
      expect(queryDto.getCustomerFilters).toHaveBeenCalled();
      expect(customerRepository.findAll).toHaveBeenCalledWith({
        fitterId: 2001,
        country: "USA",
        city: "New York",
        isActive: true,
      });
      expect(customerMapper.toDto).toHaveBeenCalledWith(mockCustomer);
    });

    it("should return empty array when no customers match filters", async () => {
      // Arrange
      const queryDto = {
        getCustomerFilters: jest.fn().mockReturnValue({
          email: "nonexistent@example.com",
        }),
      } as unknown as QueryCustomerDto;

      customerRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await service.findAll(queryDto);

      // Assert
      expect(result).toEqual([]);
      expect(customerRepository.findAll).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update customer contact information", async () => {
      // Arrange
      const customerId = "1001";
      const updateDto: UpdateCustomerDto = {
        name: "John Updated",
        email: "john.updated@example.com",
        address: "123 Updated Street",
        city: "Updated City",
        country: "Updated Country",
      };

      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await service.update(customerId, updateDto);

      // Assert
      expect(result).toEqual(mockCustomerDto);
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomerId);
      expect(mockCustomer.updateContactInfo).toHaveBeenCalled();
      expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
    });

    it("should update customer fitter", async () => {
      // Arrange
      const customerId = "1001";
      const updateDto: UpdateCustomerDto = {
        fitterId: 3001,
      };

      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await service.update(customerId, updateDto);

      // Assert
      expect(result).toEqual(mockCustomerDto);
      expect(mockCustomer.assignFitter).toHaveBeenCalledWith(3001);
      expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
    });

    it("should remove fitter when fitterId is explicitly unset", async () => {
      // Arrange
      const customerId = "1001";
      // Note: Using undefined since DTO type doesn't allow null
      const updateDto = {
        fitterId: null,
      } as any as UpdateCustomerDto;

      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await service.update(customerId, updateDto);

      // Assert
      expect(result).toEqual(mockCustomerDto);
      expect(mockCustomer.removeFitter).toHaveBeenCalled();
      expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
    });

    it("should throw NotFoundException when customer not found for update", async () => {
      // Arrange
      const customerId = "9999";
      const updateDto: UpdateCustomerDto = { name: "Not Found" };
      customerRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(customerId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomerId);
      expect(customerRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should remove customer successfully", async () => {
      // Arrange
      const customerId = "1001";
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.delete.mockResolvedValue(undefined);

      // Act
      await service.remove(customerId);

      // Assert
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomerId);
      expect(customerRepository.delete).toHaveBeenCalledWith(mockCustomerId);
    });

    it("should throw NotFoundException when customer not found for removal", async () => {
      // Arrange
      const customerId = "9999";
      customerRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(customerId)).rejects.toThrow(
        NotFoundException,
      );
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomerId);
      expect(customerRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("assignFitter", () => {
    it("should assign fitter to customer successfully", async () => {
      // Arrange
      const customerId = "1001";
      const fitterId = 3001;
      customerRepository.findById.mockResolvedValue(mockCustomer);
      customerRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await service.assignFitter(customerId, fitterId);

      // Assert
      expect(result).toEqual(mockCustomerDto);
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomerId);
      expect(mockCustomer.assignFitter).toHaveBeenCalledWith(fitterId);
      expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
      expect(customerMapper.toDto).toHaveBeenCalledWith(mockCustomer);
    });

    it("should throw NotFoundException when customer not found for fitter assignment", async () => {
      // Arrange
      const customerId = "9999";
      const fitterId = 3001;
      customerRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.assignFitter(customerId, fitterId)).rejects.toThrow(
        NotFoundException,
      );
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomerId);
      expect(customerRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("findByFitter", () => {
    it("should return customers for a specific fitter", async () => {
      // Arrange
      const fitterId = 2001;
      const customers = [mockCustomer];
      customerRepository.findByFitterId.mockResolvedValue(customers);

      // Act
      const result = await service.findByFitter(fitterId);

      // Assert
      expect(result).toEqual([mockCustomerDto]);
      expect(customerRepository.findByFitterId).toHaveBeenCalledWith(fitterId);
      expect(customerMapper.toDto).toHaveBeenCalledWith(mockCustomer);
    });

    it("should return empty array when no customers for fitter", async () => {
      // Arrange
      const fitterId = 2001;
      customerRepository.findByFitterId.mockResolvedValue([]);

      // Act
      const result = await service.findByFitter(fitterId);

      // Assert
      expect(result).toEqual([]);
      expect(customerRepository.findByFitterId).toHaveBeenCalledWith(fitterId);
    });
  });

  describe("findWithoutFitter", () => {
    it("should return customers without assigned fitter", async () => {
      // Arrange
      const customersWithoutFitter = [mockCustomer];
      customerRepository.findActiveCustomersWithoutFitter.mockResolvedValue(
        customersWithoutFitter,
      );

      // Act
      const result = await service.findWithoutFitter();

      // Assert
      expect(result).toEqual([mockCustomerDto]);
      expect(
        customerRepository.findActiveCustomersWithoutFitter,
      ).toHaveBeenCalledWith();
      expect(customerMapper.toDto).toHaveBeenCalledWith(mockCustomer);
    });

    it("should return empty array when all customers have fitters", async () => {
      // Arrange
      customerRepository.findActiveCustomersWithoutFitter.mockResolvedValue([]);

      // Act
      const result = await service.findWithoutFitter();

      // Assert
      expect(result).toEqual([]);
      expect(
        customerRepository.findActiveCustomersWithoutFitter,
      ).toHaveBeenCalledWith();
    });
  });

  describe("getCustomerCountByFitter", () => {
    it("should return customer count for a fitter", async () => {
      // Arrange
      const fitterId = 2001;
      const expectedCount = 25;
      customerRepository.countByFitterId.mockResolvedValue(expectedCount);

      // Act
      const result = await service.getCustomerCountByFitter(fitterId);

      // Assert
      expect(result).toBe(expectedCount);
      expect(customerRepository.countByFitterId).toHaveBeenCalledWith(fitterId);
    });

    it("should return zero when fitter has no customers", async () => {
      // Arrange
      const fitterId = 2001;
      customerRepository.countByFitterId.mockResolvedValue(0);

      // Act
      const result = await service.getCustomerCountByFitter(fitterId);

      // Assert
      expect(result).toBe(0);
      expect(customerRepository.countByFitterId).toHaveBeenCalledWith(fitterId);
    });
  });

  describe("bulkCreate", () => {
    it("should create multiple customers in batch", async () => {
      // Arrange
      const createDtos: CreateCustomerDto[] = [
        {
          email: "customer1@example.com",
          name: "Customer 1",
          address: "123 First St",
          city: "City 1",
          country: "USA",
        },
        {
          email: "customer2@example.com",
          name: "Customer 2",
          address: "456 Second St",
          city: "City 2",
          country: "USA",
        },
      ];

      const createdCustomers = [
        mockCustomer,
        createMockCustomer({ name: "Customer 2" }),
      ];
      customerRepository.bulkCreate.mockResolvedValue(createdCustomers);

      // Act
      const result = await service.bulkCreate(createDtos);

      // Assert
      expect(result).toHaveLength(2);
      expect(customerRepository.bulkCreate).toHaveBeenCalled();
    });

    it("should handle empty bulk creation", async () => {
      // Arrange
      const createDtos: CreateCustomerDto[] = [];
      customerRepository.bulkCreate.mockResolvedValue([]);

      // Act
      const result = await service.bulkCreate(createDtos);

      // Assert
      expect(result).toEqual([]);
      expect(customerRepository.bulkCreate).toHaveBeenCalledWith([]);
    });
  });

  describe("validateDataIntegrity", () => {
    it("should validate customer data integrity - valid customer", async () => {
      // Arrange
      const customerId = "1001";
      customerRepository.findById.mockResolvedValue(mockCustomer);

      // Act
      const result = await service.validateDataIntegrity(customerId);

      // Assert
      expect(result).toEqual({
        valid: true,
        issues: [],
      });
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomerId);
    });

    it("should identify data integrity issues - missing name", async () => {
      // Arrange
      const customerId = "1001";
      const invalidCustomer = createMockCustomer({
        name: "",
      });

      customerRepository.findById.mockResolvedValue(invalidCustomer);

      // Act
      const result = await service.validateDataIntegrity(customerId);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.issues).toContain("Missing customer name");
    });

    it("should throw NotFoundException for non-existent customer validation", async () => {
      // Arrange
      const customerId = "9999";
      customerRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.validateDataIntegrity(customerId)).rejects.toThrow(
        NotFoundException,
      );
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomerId);
    });
  });

  describe("edge cases", () => {
    it("should handle repository errors gracefully", async () => {
      // Arrange
      const customerId = "1001";
      customerRepository.findById.mockRejectedValue(
        new Error("Database connection error"),
      );

      // Act & Assert
      await expect(service.findOne(customerId)).rejects.toThrow(
        "Database connection error",
      );
      expect(customerRepository.findById).toHaveBeenCalledWith(mockCustomerId);
    });
  });
});
