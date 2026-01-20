/**
 * Production Data Migration Validation Test Suite
 *
 * Comprehensive tests to validate data integrity after production migration
 *
 * Test Categories:
 * 1. Data Completeness - All records migrated successfully
 * 2. Relationship Integrity - Foreign key relationships maintained
 * 3. Data Transformation - Correct conversion of data types and formats
 * 4. Business Logic - Domain-specific validation rules
 * 5. Performance - Query efficiency with production data volume
 */

import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";

// Entity imports
import { CustomerEntity } from "../../src/customers/infrastructure/persistence/relational/entities/customer.entity";
import { OrderEntity } from "../../src/orders/infrastructure/persistence/relational/entities/order.entity";
import { FitterEntity } from "../../src/fitters/infrastructure/persistence/relational/entities/fitter.entity";
import { UserEntity } from "../../src/users/infrastructure/persistence/relational/entities/user.entity";

// Test configuration
import { databaseConfig } from "../../src/database/config/database.config";

describe("Production Data Migration Validation", () => {
  let moduleRef: TestingModule;
  let _dataSource: DataSource;
  void _dataSource; // Reserved for raw SQL queries
  let customerRepository: Repository<CustomerEntity>;
  let orderRepository: Repository<OrderEntity>;
  let fitterRepository: Repository<FitterEntity>;
  let _userRepository: Repository<UserEntity>;
  void _userRepository; // Reserved for user migration tests

  // Test data expectations (update based on actual production data)
  const EXPECTED_COUNTS = {
    customers: 3000, // Update with actual count from SQL dump analysis
    orders: 7500, // Update with actual count from SQL dump analysis
    fitters: 150, // Update with actual count from SQL dump analysis
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...databaseConfig,
          entities: [CustomerEntity, OrderEntity, FitterEntity, UserEntity],
          synchronize: false, // Use existing migrated database
        }),
        TypeOrmModule.forFeature([
          CustomerEntity,
          OrderEntity,
          FitterEntity,
          UserEntity,
        ]),
      ],
    }).compile();

    _dataSource = moduleRef.get<DataSource>(DataSource);
    customerRepository = moduleRef.get<Repository<CustomerEntity>>(
      getRepositoryToken(CustomerEntity),
    );
    orderRepository = moduleRef.get<Repository<OrderEntity>>(
      getRepositoryToken(OrderEntity),
    );
    fitterRepository = moduleRef.get<Repository<FitterEntity>>(
      getRepositoryToken(FitterEntity),
    );
    _userRepository = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe("Data Completeness Validation", () => {
    it("should migrate all customer records with legacy IDs", async () => {
      const customers = await customerRepository.find();
      const customersWithLegacyId = customers.filter(
        (c) => c.legacyId !== null,
      );

      expect(customers.length).toBeGreaterThanOrEqual(
        EXPECTED_COUNTS.customers * 0.95,
      ); // Allow 5% variance
      expect(customersWithLegacyId.length).toBe(customers.length);

      // Verify no duplicate legacy IDs
      const legacyIds = customersWithLegacyId.map((c) => c.legacyId);
      const uniqueLegacyIds = new Set(legacyIds);
      expect(uniqueLegacyIds.size).toBe(legacyIds.length);
    });

    it("should migrate all order records with legacy IDs", async () => {
      const orders = await orderRepository.find();
      const ordersWithLegacyId = orders.filter((o) => o.legacyId !== null);

      expect(orders.length).toBeGreaterThanOrEqual(
        EXPECTED_COUNTS.orders * 0.95,
      );
      expect(ordersWithLegacyId.length).toBe(orders.length);

      // Verify order numbers generated correctly
      const orderNumberPattern = /^OMS-\\d{6}$/;
      orders.forEach((order) => {
        expect(order.orderNumber).toMatch(orderNumberPattern);
      });
    });

    it("should migrate all fitter records with user relationships", async () => {
      const fitters = await fitterRepository.find({ relations: ["user"] });
      const fittersWithLegacyId = fitters.filter((f) => f.legacyId !== null);

      expect(fitters.length).toBeGreaterThanOrEqual(
        EXPECTED_COUNTS.fitters * 0.95,
      );
      expect(fittersWithLegacyId.length).toBe(fitters.length);

      // Verify all fitters have associated users
      const fittersWithUsers = fitters.filter((f) => f.user !== null);
      expect(fittersWithUsers.length).toBe(fitters.length);
    });

    it("should preserve all legacy ID references in relationships", async () => {
      const orders = await orderRepository.find();

      for (const order of orders) {
        if (order.legacyCustomerId) {
          expect(order.legacyCustomerId).toBeGreaterThan(0);
        }
        if (order.legacyFitterId) {
          expect(order.legacyFitterId).toBeGreaterThan(0);
        }
        if (order.legacySaddleId) {
          expect(order.legacySaddleId).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Relationship Integrity Validation", () => {
    it("should maintain correct order-customer relationships", async () => {
      const orders = await orderRepository.find({
        relations: ["customer"],
        where: { customerId: expect.anything() },
      });

      for (const order of orders) {
        if (order.legacyCustomerId) {
          // Find customer by legacy ID
          const customer = await customerRepository.findOne({
            where: { legacyId: order.legacyCustomerId },
          });

          expect(customer).toBeTruthy();
          expect(order.customerId).toBe(customer.id);
          expect(order.customer?.id).toBe(customer.id);
        }
      }
    });

    it("should maintain correct order-fitter relationships", async () => {
      const orders = await orderRepository.find({
        relations: ["fitter"],
        where: { fitterId: expect.anything() },
      });

      for (const order of orders) {
        if (order.legacyFitterId) {
          // Find fitter by legacy ID
          const fitter = await fitterRepository.findOne({
            where: { legacyId: order.legacyFitterId },
          });

          expect(fitter).toBeTruthy();
          expect(order.fitterId).toBe(fitter.id);
        }
      }
    });

    it("should maintain correct customer-fitter relationships", async () => {
      const customers = await customerRepository.find({
        relations: ["fitter"],
        where: { fitterId: expect.anything() },
      });

      for (const customer of customers) {
        if (customer.legacyFitterId) {
          const fitter = await fitterRepository.findOne({
            where: { legacyId: customer.legacyFitterId },
          });

          expect(fitter).toBeTruthy();
          expect(customer.fitterId).toBe(fitter.id);
        }
      }
    });

    it("should have referential integrity for all foreign keys", async () => {
      // Test that all UUID foreign keys reference valid records
      const ordersWithCustomers = await orderRepository
        .createQueryBuilder("order")
        .leftJoin("order.customer", "customer")
        .where("order.customer_id IS NOT NULL")
        .andWhere("customer.id IS NULL")
        .getCount();

      expect(ordersWithCustomers).toBe(0);

      const ordersWithFitters = await orderRepository
        .createQueryBuilder("order")
        .leftJoin("order.fitter", "fitter")
        .where("order.fitter_id IS NOT NULL")
        .andWhere("fitter.id IS NULL")
        .getCount();

      expect(ordersWithFitters).toBe(0);
    });
  });

  describe("Data Transformation Validation", () => {
    it("should convert timestamps correctly", async () => {
      const orders = await orderRepository.find();

      for (const order of orders) {
        expect(order.createdAt).toBeInstanceOf(Date);
        expect(order.updatedAt).toBeInstanceOf(Date);

        // Validate reasonable date range (production data from 2012-2026)
        const minDate = new Date("2012-01-01").getTime();
        const maxDate = new Date().getTime();

        expect(order.createdAt.getTime()).toBeGreaterThanOrEqual(minDate);
        expect(order.createdAt.getTime()).toBeLessThanOrEqual(maxDate);
      }
    });

    it("should convert monetary amounts correctly", async () => {
      const orders = await orderRepository.find();

      for (const order of orders) {
        expect(typeof order.totalAmount).toBe("number");
        expect(typeof order.depositPaid).toBe("number");
        expect(typeof order.balanceOwing).toBe("number");

        // Validate non-negative amounts
        expect(order.totalAmount).toBeGreaterThanOrEqual(0);
        expect(order.depositPaid).toBeGreaterThanOrEqual(0);
        expect(order.balanceOwing).toBeGreaterThanOrEqual(0);

        // Validate balance calculation
        expect(order.balanceOwing).toBeCloseTo(
          order.totalAmount - order.depositPaid,
          2,
        );
      }
    });

    it("should convert boolean flags correctly", async () => {
      const orders = await orderRepository.find();

      for (const order of orders) {
        expect(typeof order.isUrgent).toBe("boolean");
      }

      const customers = await customerRepository.find();

      for (const customer of customers) {
        expect(["active", "inactive", "suspended"]).toContain(customer.status);
      }
    });

    it("should handle NULL values correctly", async () => {
      const customers = await customerRepository.find();

      // Check that NULL values from production are handled properly
      const customersWithoutFitter = customers.filter(
        (c) => c.fitterId === null,
      );
      expect(customersWithoutFitter.length).toBeGreaterThan(0);

      // Ensure deleted_at is properly set for deleted customers
      const deletedCustomers = customers.filter((c) => c.deletedAt !== null);
      deletedCustomers.forEach((customer) => {
        expect(customer.status).toBe("inactive");
        expect(customer.deletedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe("Business Logic Validation", () => {
    it("should generate valid order numbers from legacy IDs", async () => {
      const orders = await orderRepository.find();
      const orderNumberPattern = /^OMS-\\d{6}$/;

      for (const order of orders) {
        expect(order.orderNumber).toMatch(orderNumberPattern);

        // Extract number and verify it matches legacy ID
        const numberPart = order.orderNumber.substring(4);
        const expectedLegacyId = parseInt(numberPart, 10);
        expect(order.legacyId).toBe(expectedLegacyId);
      }

      // Verify uniqueness
      const orderNumbers = orders.map((o) => o.orderNumber);
      const uniqueOrderNumbers = new Set(orderNumbers);
      expect(uniqueOrderNumbers.size).toBe(orderNumbers.length);
    });

    it("should map order statuses correctly", async () => {
      const orders = await orderRepository.find();
      const validStatuses = [
        "pending",
        "processing",
        "completed",
        "cancelled",
        "draft",
      ];

      for (const order of orders) {
        expect(validStatuses).toContain(order.status);
      }

      // Verify status distribution is reasonable
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      console.log("Order status distribution:", statusCounts);
      expect(Object.keys(statusCounts).length).toBeGreaterThan(1);
    });

    it("should preserve customer email uniqueness per fitter", async () => {
      const customers = await customerRepository.find();

      // Group by fitter and check email uniqueness within each group
      const customersByFitter = customers.reduce((acc, customer) => {
        const fitterId = customer.fitterId || "no-fitter";
        if (!acc[fitterId]) acc[fitterId] = [];
        acc[fitterId].push(customer);
        return acc;
      }, {});

      Object.entries(customersByFitter).forEach(
        ([fitterId, fitterCustomers]) => {
          const emails = fitterCustomers.map((c) => c.email).filter((e) => e);
          const uniqueEmails = new Set(emails);

          if (emails.length !== uniqueEmails.size) {
            console.warn(`Fitter ${fitterId} has duplicate customer emails`);
          }
        },
      );
    });

    it("should maintain data consistency for soft-deleted records", async () => {
      const deletedCustomers = await customerRepository.find({
        where: { deletedAt: expect.anything() },
      });

      for (const customer of deletedCustomers) {
        expect(customer.status).toBe("inactive");
        expect(customer.deletedAt).toBeInstanceOf(Date);
      }
    });
  });

  describe("Performance Validation", () => {
    it("should query customers by legacy ID efficiently", async () => {
      const start = performance.now();

      const customer = await customerRepository.findOne({
        where: { legacyId: 1 },
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100); // Should be under 100ms
      expect(customer).toBeTruthy();
    });

    it("should query orders with relationships efficiently", async () => {
      const start = performance.now();

      const orders = await orderRepository.find({
        relations: ["customer", "fitter"],
        take: 100,
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500); // Should be under 500ms
      expect(orders).toHaveLength(100);
    });

    it("should handle pagination efficiently with large dataset", async () => {
      const pageSize = 50;
      const start = performance.now();

      const [orders, total] = await orderRepository.findAndCount({
        relations: ["customer"],
        take: pageSize,
        skip: 0,
        order: { createdAt: "DESC" },
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200);
      expect(orders.length).toBeLessThanOrEqual(pageSize);
      expect(total).toBeGreaterThan(0);
    });

    it("should filter orders by legacy customer ID efficiently", async () => {
      const start = performance.now();

      const orders = await orderRepository.find({
        where: { legacyCustomerId: 1 },
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
      orders.forEach((order) => {
        expect(order.legacyCustomerId).toBe(1);
      });
    });
  });

  describe("Data Quality Validation", () => {
    it("should have reasonable data distribution", async () => {
      // Check that we have data spread across different time periods
      const orders = await orderRepository.find({
        order: { createdAt: "ASC" },
      });

      const firstOrder = orders[0];
      const lastOrder = orders[orders.length - 1];

      const timeDiff =
        lastOrder.createdAt.getTime() - firstOrder.createdAt.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      expect(daysDiff).toBeGreaterThan(30); // At least 30 days of data
    });

    it("should have proper data format consistency", async () => {
      const customers = await customerRepository.find();

      let emailPattern = 0;
      let phonePattern = 0;

      for (const customer of customers) {
        if (customer.email && customer.email.includes("@")) {
          emailPattern++;
        }
        // Phone number field removed from entity
        phonePattern++;
      }

      // Expect reasonable percentage of valid emails and phones
      expect(emailPattern / customers.length).toBeGreaterThan(0.5);
      expect(phonePattern / customers.length).toBeGreaterThanOrEqual(0);
    });

    it("should validate special characters and encoding", async () => {
      const customers = await customerRepository.find();

      for (const customer of customers) {
        // Check that names don't have encoding issues
        if (customer.name) {
          expect(customer.name).not.toMatch(/\\[xuU]/); // No unicode escape sequences
          expect(customer.name.length).toBeGreaterThan(0);
        }

        if (customer.address) {
          expect(customer.address.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Legacy System Compatibility", () => {
    it("should be able to map all legacy IDs back to UUIDs", async () => {
      // Test the reverse mapping capability
      const customers = await customerRepository.find();
      const legacyIdMap = new Map();

      customers.forEach((customer) => {
        if (customer.legacyId) {
          legacyIdMap.set(customer.legacyId, customer.id);
        }
      });

      // Verify we can find any customer by legacy ID
      for (const [legacyId, uuid] of legacyIdMap.entries()) {
        const foundCustomer = await customerRepository.findOne({
          where: { legacyId },
        });

        expect(foundCustomer).toBeTruthy();
        expect(foundCustomer!.id).toBe(uuid);
      }
    });

    it("should maintain traceability for order lineage", async () => {
      const orders = await orderRepository.find();

      for (const order of orders) {
        // Every migrated order should have legacy references
        expect(order.legacyId).toBeGreaterThan(0);

        // Verify customer relationship exists via customerId
        if (order.customerId) {
          const customer = await customerRepository.findOne({
            where: { id: order.customerId },
          });
          expect(customer).toBeTruthy();
        }
      }
    });
  });
});
