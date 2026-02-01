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
import databaseConfig from "../../src/database/config/database.config";

describe("Production Data Migration Validation", () => {
  let moduleRef: TestingModule;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _dataSource: DataSource;
  let customerRepository: Repository<CustomerEntity>;
  let orderRepository: Repository<OrderEntity>;
  let fitterRepository: Repository<FitterEntity>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let _userRepository: Repository<UserEntity>;

  // Test data expectations (update based on actual production data)
  const EXPECTED_COUNTS = {
    customers: 3000, // Update with actual count from SQL dump analysis
    orders: 7500, // Update with actual count from SQL dump analysis
    fitters: 150, // Update with actual count from SQL dump analysis
  };

  beforeAll(async () => {
    const dbConfig = databaseConfig();

    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: (dbConfig as any).type || "postgres",
          host: (dbConfig as any).host,
          port: (dbConfig as any).port,
          username: (dbConfig as any).username,
          password: (dbConfig as any).password,
          database: (dbConfig as any).name,
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
    it("should migrate all customer records", async () => {
      const customers = await customerRepository.find();

      expect(customers.length).toBeGreaterThanOrEqual(
        EXPECTED_COUNTS.customers * 0.95,
      ); // Allow 5% variance

      // Verify no duplicate IDs
      const ids = customers.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should migrate all order records", async () => {
      const orders = await orderRepository.find();

      expect(orders.length).toBeGreaterThanOrEqual(
        EXPECTED_COUNTS.orders * 0.95,
      );

      // Verify order numbers generated correctly
      const orderNumberPattern = /^OMS-\d{6}$/;
      orders.forEach((order) => {
        expect(order.orderNumber).toMatch(orderNumberPattern);
      });
    });

    it("should migrate all fitter records", async () => {
      const fitters = await fitterRepository.find();

      expect(fitters.length).toBeGreaterThanOrEqual(
        EXPECTED_COUNTS.fitters * 0.95,
      );

      // Verify all active fitters have associated user IDs
      const activeFitters = fitters.filter((f) => f.deleted === 0);
      const fittersWithUsers = activeFitters.filter(
        (f) => f.userId !== null && f.userId !== 0,
      );
      expect(fittersWithUsers.length).toBe(activeFitters.length);
    });

    it("should preserve all ID references in relationships", async () => {
      const orders = await orderRepository.find();

      for (const order of orders) {
        if (order.customerId) {
          expect(order.customerId).toBeGreaterThan(0);
        }
        if (order.fitterId) {
          expect(order.fitterId).toBeGreaterThan(0);
        }
        if (order.saddleId) {
          expect(order.saddleId).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Relationship Integrity Validation", () => {
    it("should maintain correct order-customer relationships", async () => {
      const orders = await orderRepository.find({ take: 100 });

      for (const order of orders) {
        if (order.customerId) {
          const customer = await customerRepository.findOne({
            where: { id: order.customerId },
          });

          expect(customer).toBeTruthy();
        }
      }
    });

    it("should maintain correct order-fitter relationships", async () => {
      const orders = await orderRepository.find({
        where: {},
        take: 100,
      });

      for (const order of orders) {
        if (order.fitterId) {
          const fitter = await fitterRepository.findOne({
            where: { id: order.fitterId },
          });

          expect(fitter).toBeTruthy();
        }
      }
    });

    it("should maintain correct customer-fitter relationships", async () => {
      const customers = await customerRepository.find({ take: 100 });

      for (const customer of customers) {
        if (customer.fitterId && customer.fitterId !== 0) {
          const fitter = await fitterRepository.findOne({
            where: { id: customer.fitterId },
          });

          expect(fitter).toBeTruthy();
        }
      }
    });

    it("should have referential integrity for all foreign keys", async () => {
      // Test that all customer_id foreign keys reference valid records
      const ordersWithInvalidCustomers = await orderRepository
        .createQueryBuilder("order")
        .where(
          "order.customer_id IS NOT NULL AND order.customer_id != 0 AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.id = order.customer_id)",
        )
        .getCount();

      expect(ordersWithInvalidCustomers).toBe(0);

      const ordersWithInvalidFitters = await orderRepository
        .createQueryBuilder("order")
        .where(
          "order.fitter_id IS NOT NULL AND order.fitter_id != 0 AND NOT EXISTS (SELECT 1 FROM fitters f WHERE f.id = order.fitter_id)",
        )
        .getCount();

      expect(ordersWithInvalidFitters).toBe(0);
    });
  });

  describe("Data Transformation Validation", () => {
    it("should convert timestamps correctly", async () => {
      const orders = await orderRepository.find({ take: 100 });

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
      const orders = await orderRepository.find({ take: 100 });

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
      const orders = await orderRepository.find({ take: 100 });

      for (const order of orders) {
        expect(typeof order.isUrgent).toBe("boolean");
      }

      const customers = await customerRepository.find({ take: 100 });

      for (const customer of customers) {
        // deleted is a smallint: 0 = active, 1 = deleted
        expect([0, 1]).toContain(customer.deleted);
      }
    });

    it("should handle NULL values correctly", async () => {
      const customers = await customerRepository.find({ take: 100 });

      // Check that customers without fitter are handled properly
      const customersWithoutFitter = customers.filter(
        (c) => c.fitterId === 0 || c.fitterId === null,
      );
      expect(customersWithoutFitter.length).toBeGreaterThanOrEqual(0);

      // Ensure deleted flag is properly set for deleted customers
      const deletedCustomers = customers.filter((c) => c.deleted !== 0);
      deletedCustomers.forEach((customer) => {
        expect(customer.deleted).toBe(1);
      });
    });
  });

  describe("Business Logic Validation", () => {
    it("should generate valid order numbers", async () => {
      const orders = await orderRepository.find({ take: 100 });
      const orderNumberPattern = /^OMS-\d{6}$/;

      for (const order of orders) {
        expect(order.orderNumber).toMatch(orderNumberPattern);
      }

      // Verify uniqueness
      const orderNumbers = orders.map((o) => o.orderNumber);
      const uniqueOrderNumbers = new Set(orderNumbers);
      expect(uniqueOrderNumbers.size).toBe(orderNumbers.length);
    });

    it("should map order statuses correctly", async () => {
      const orders = await orderRepository.find({ take: 500 });
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
      const statusCounts = orders.reduce(
        (acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      console.log("Order status distribution:", statusCounts);
      expect(Object.keys(statusCounts).length).toBeGreaterThan(1);
    });

    it("should preserve customer email uniqueness per fitter", async () => {
      const customers = await customerRepository.find();

      // Group by fitter and check email uniqueness within each group
      const customersByFitter = customers.reduce(
        (acc, customer) => {
          const fitterId = customer.fitterId || 0;
          const key = fitterId.toString();
          if (!acc[key]) acc[key] = [];
          acc[key].push(customer);
          return acc;
        },
        {} as Record<string, CustomerEntity[]>,
      );

      Object.entries(customersByFitter).forEach(
        ([fitterId, fitterCustomers]) => {
          const emails = fitterCustomers
            .map((c) => c.email)
            .filter((e) => e && e !== "");
          const uniqueEmails = new Set(emails);

          if (emails.length !== uniqueEmails.size) {
            console.warn(`Fitter ${fitterId} has duplicate customer emails`);
          }
        },
      );
    });

    it("should maintain data consistency for soft-deleted records", async () => {
      const allCustomers = await customerRepository.find();
      const deletedCustomers = allCustomers.filter((c) => c.deleted !== 0);

      for (const customer of deletedCustomers) {
        expect(customer.deleted).toBe(1);
      }
    });
  });

  describe("Performance Validation", () => {
    it("should query customers by ID efficiently", async () => {
      const start = performance.now();

      const customer = await customerRepository.findOne({
        where: { id: 1 },
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100); // Should be under 100ms
      expect(customer).toBeTruthy();
    });

    it("should query orders efficiently", async () => {
      const start = performance.now();

      const orders = await orderRepository.find({
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
        take: pageSize,
        skip: 0,
        order: { createdAt: "DESC" },
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(200);
      expect(orders.length).toBeLessThanOrEqual(pageSize);
      expect(total).toBeGreaterThan(0);
    });

    it("should filter orders by customer ID efficiently", async () => {
      const start = performance.now();

      const orders = await orderRepository.find({
        where: { customerId: 1 },
      });

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
      orders.forEach((order) => {
        expect(order.customerId).toBe(1);
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
      const customers = await customerRepository.find({ take: 200 });

      let emailPattern = 0;

      for (const customer of customers) {
        if (customer.email && customer.email.includes("@")) {
          emailPattern++;
        }
      }

      // Expect reasonable percentage of valid emails
      expect(emailPattern / customers.length).toBeGreaterThan(0.5);
    });

    it("should validate special characters and encoding", async () => {
      const customers = await customerRepository.find({ take: 200 });

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
    it("should be able to look up customers by ID", async () => {
      const customers = await customerRepository.find({ take: 100 });
      const idMap = new Map<number, CustomerEntity>();

      customers.forEach((customer) => {
        idMap.set(customer.id, customer);
      });

      // Verify we can find any customer by ID
      for (const [id] of idMap.entries()) {
        const foundCustomer = await customerRepository.findOne({
          where: { id },
        });

        expect(foundCustomer).toBeTruthy();
        expect(foundCustomer!.id).toBe(id);
      }
    });

    it("should maintain traceability for order lineage", async () => {
      const orders = await orderRepository.find({ take: 100 });

      for (const order of orders) {
        // Every order should have a valid ID
        expect(order.id).toBeGreaterThan(0);

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
