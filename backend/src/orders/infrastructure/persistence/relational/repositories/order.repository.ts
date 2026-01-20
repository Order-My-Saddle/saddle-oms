import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindManyOptions,
  FindOneOptions,
  Between,
  LessThanOrEqual,
  MoreThan,
  Not,
  In,
} from "typeorm";
import { IOrderRepository } from "../../../../domain/order.repository";
import { Order } from "../../../../domain/order";
import { OrderId } from "../../../../domain/value-objects/order-id.value-object";
import { OrderStatus } from "../../../../domain/value-objects/order-status.value-object";
import { OrderPriority } from "../../../../domain/value-objects/order-priority.value-object";
import { OrderEntity } from "../entities/order.entity";
import { OrderMapper } from "../mappers/order.mapper";

/**
 * Order TypeORM Repository Implementation
 *
 * Implements the domain repository interface using TypeORM.
 * Handles data persistence and retrieval operations for orders.
 */
@Injectable()
export class OrderRepository implements IOrderRepository {
  private readonly logger = new Logger(OrderRepository.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderEntityRepository: Repository<OrderEntity>,
    private readonly orderMapper: OrderMapper,
  ) {}

  /**
   * Save an order entity
   */
  async save(order: Order): Promise<void> {
    try {
      const entity = this.orderMapper.toPersistence(order);
      await this.orderEntityRepository.save(entity);

      this.logger.debug(`Saved order: ${order.id.toString()}`);
    } catch (error) {
      this.logger.error(`Failed to save order: ${error.message}`, error.stack);
      throw new Error(`Failed to save order: ${error.message}`);
    }
  }

  /**
   * Find order by ID
   */
  async findById(id: OrderId): Promise<Order | null> {
    try {
      const options: FindOneOptions<OrderEntity> = {
        where: { id: parseInt(id.toString(), 10) },
      };

      const entity = await this.orderEntityRepository.findOne(options);

      if (!entity) {
        return null;
      }

      return this.orderMapper.toDomain(entity);
    } catch (error) {
      this.logger.error(
        `Failed to find order by ID: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to find order: ${error.message}`);
    }
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    try {
      const options: FindOneOptions<OrderEntity> = {
        where: { orderNumber },
      };

      const entity = await this.orderEntityRepository.findOne(options);

      if (!entity) {
        return null;
      }

      return this.orderMapper.toDomain(entity);
    } catch (error) {
      this.logger.error(
        `Failed to find order by order number: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to find order: ${error.message}`);
    }
  }

  /**
   * Find all orders with optional filters
   */
  async findAll(filters?: {
    customerId?: number;
    fitterId?: number;
    factoryId?: number;
    status?: OrderStatus;
    priority?: OrderPriority;
    isUrgent?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    overdue?: boolean;
  }): Promise<Order[]> {
    try {
      const options: FindManyOptions<OrderEntity> = {
        order: { createdAt: "DESC" },
      };

      if (filters) {
        const where: any = {};

        if (filters.customerId) {
          where.customerId = filters.customerId;
        }

        if (filters.fitterId) {
          where.fitterId = filters.fitterId;
        }

        if (filters.factoryId) {
          where.factoryId = filters.factoryId;
        }

        if (filters.status) {
          where.status = filters.status.toString();
        }

        if (filters.priority) {
          where.priority = filters.priority.toString();
        }

        if (filters.isUrgent !== undefined) {
          where.isUrgent = filters.isUrgent;
        }

        if (filters.dateFrom && filters.dateTo) {
          where.createdAt = Between(filters.dateFrom, filters.dateTo);
        } else if (filters.dateFrom) {
          where.createdAt = MoreThan(filters.dateFrom);
        } else if (filters.dateTo) {
          where.createdAt = LessThanOrEqual(filters.dateTo);
        }

        if (filters.overdue) {
          where.estimatedDeliveryDate = LessThanOrEqual(new Date());
          // Exclude completed orders from overdue filter
          where.status = Not(In(["delivered", "cancelled", "returned"]));
        }

        options.where = where;
      }

      const entities = await this.orderEntityRepository.find(options);
      return this.orderMapper.toDomainMany(entities);
    } catch (error) {
      this.logger.error(`Failed to find orders: ${error.message}`, error.stack);
      throw new Error(`Failed to find orders: ${error.message}`);
    }
  }

  /**
   * Find orders by customer ID
   */
  async findByCustomerId(customerId: number): Promise<Order[]> {
    return this.findAll({ customerId });
  }

  /**
   * Find orders by fitter ID
   */
  async findByFitterId(fitterId: number): Promise<Order[]> {
    return this.findAll({ fitterId });
  }

  /**
   * Find orders by factory ID
   */
  async findByFactoryId(factoryId: number): Promise<Order[]> {
    return this.findAll({ factoryId });
  }

  /**
   * Find orders by status
   */
  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.findAll({ status });
  }

  /**
   * Find urgent orders
   */
  async findUrgentOrders(): Promise<Order[]> {
    return this.findAll({ isUrgent: true });
  }

  /**
   * Find overdue orders
   */
  async findOverdueOrders(): Promise<Order[]> {
    return this.findAll({ overdue: true });
  }

  /**
   * Find orders requiring deposit
   */
  async findOrdersRequiringDeposit(): Promise<Order[]> {
    try {
      const entities = await this.orderEntityRepository
        .createQueryBuilder("order")
        .where("order.depositPaid < (order.totalAmount * 0.3)")
        .andWhere("order.status NOT IN (:...statuses)", {
          statuses: ["delivered", "cancelled", "returned"],
        })
        .orderBy("order.createdAt", "DESC")
        .getMany();

      return this.orderMapper.toDomainMany(entities);
    } catch (error) {
      this.logger.error(
        `Failed to find orders requiring deposit: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to find orders: ${error.message}`);
    }
  }

  /**
   * Find orders in production
   */
  async findOrdersInProduction(): Promise<Order[]> {
    try {
      const entities = await this.orderEntityRepository
        .createQueryBuilder("order")
        .where("order.status IN (:...statuses)", {
          statuses: ["in_production", "quality_control"],
        })
        .orderBy("order.priority", "DESC")
        .addOrderBy("order.createdAt", "ASC")
        .getMany();

      return this.orderMapper.toDomainMany(entities);
    } catch (error) {
      this.logger.error(
        `Failed to find orders in production: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to find orders: ${error.message}`);
    }
  }

  /**
   * Find recent orders
   */
  async findRecentOrders(days: number = 30): Promise<Order[]> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    return this.findAll({ dateFrom });
  }

  /**
   * Count orders by status
   */
  async countByStatus(status: OrderStatus): Promise<number> {
    try {
      return await this.orderEntityRepository.count({
        where: { status: status.toString() },
      });
    } catch (error) {
      this.logger.error(
        `Failed to count orders by status: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to count orders: ${error.message}`);
    }
  }

  /**
   * Count orders by customer
   */
  async countByCustomerId(customerId: number): Promise<number> {
    try {
      return await this.orderEntityRepository.count({
        where: { customerId },
      });
    } catch (error) {
      this.logger.error(
        `Failed to count orders by customer: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to count orders: ${error.message}`);
    }
  }

  /**
   * Count urgent orders
   */
  async countUrgentOrders(): Promise<number> {
    try {
      return await this.orderEntityRepository.count({
        where: { isUrgent: true },
      });
    } catch (error) {
      this.logger.error(
        `Failed to count urgent orders: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to count orders: ${error.message}`);
    }
  }

  /**
   * Count overdue orders
   */
  async countOverdueOrders(): Promise<number> {
    try {
      return await this.orderEntityRepository
        .createQueryBuilder("order")
        .where("order.estimatedDeliveryDate <= :now", { now: new Date() })
        .andWhere("order.status NOT IN (:...statuses)", {
          statuses: ["delivered", "cancelled", "returned"],
        })
        .getCount();
    } catch (error) {
      this.logger.error(
        `Failed to count overdue orders: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to count orders: ${error.message}`);
    }
  }

  /**
   * Get total order value for customer
   */
  async getTotalValueByCustomerId(customerId: number): Promise<number> {
    try {
      const result = await this.orderEntityRepository
        .createQueryBuilder("order")
        .select("SUM(order.totalAmount)", "total")
        .where("order.customerId = :customerId", { customerId })
        .getRawOne();

      return parseFloat(result?.total || "0");
    } catch (error) {
      this.logger.error(
        `Failed to get total value by customer: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to calculate total value: ${error.message}`);
    }
  }

  /**
   * Get average order value
   */
  async getAverageOrderValue(): Promise<number> {
    try {
      const result = await this.orderEntityRepository
        .createQueryBuilder("order")
        .select("AVG(order.totalAmount)", "average")
        .getRawOne();

      return parseFloat(result?.average || "0");
    } catch (error) {
      this.logger.error(
        `Failed to get average order value: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to calculate average: ${error.message}`);
    }
  }

  /**
   * Delete order (soft delete)
   */
  async delete(id: OrderId): Promise<void> {
    try {
      await this.orderEntityRepository.softDelete({ id: parseInt(id.toString(), 10) });
      this.logger.debug(`Soft deleted order: ${id.toString()}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete order: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to delete order: ${error.message}`);
    }
  }

  /**
   * Check if order number exists
   */
  async existsByOrderNumber(orderNumber: string): Promise<boolean> {
    try {
      const count = await this.orderEntityRepository.count({
        where: { orderNumber },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check order number existence: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Find orders with pending payments
   */
  async findOrdersWithPendingPayments(): Promise<Order[]> {
    try {
      const entities = await this.orderEntityRepository
        .createQueryBuilder("order")
        .where("order.balanceOwing > 0")
        .andWhere("order.status NOT IN (:...statuses)", {
          statuses: ["cancelled", "returned"],
        })
        .orderBy("order.estimatedDeliveryDate", "ASC")
        .getMany();

      return this.orderMapper.toDomainMany(entities);
    } catch (error) {
      this.logger.error(
        `Failed to find orders with pending payments: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to find orders: ${error.message}`);
    }
  }

  /**
   * Find orders for production scheduling
   */
  async findOrdersForProduction(limit: number = 50): Promise<Order[]> {
    try {
      const entities = await this.orderEntityRepository
        .createQueryBuilder("order")
        .where("order.status IN (:...statuses)", {
          statuses: ["confirmed", "in_production", "quality_control"],
        })
        .orderBy("order.priority", "DESC")
        .addOrderBy("order.isUrgent", "DESC")
        .addOrderBy("order.estimatedDeliveryDate", "ASC")
        .limit(limit)
        .getMany();

      return this.orderMapper.toDomainMany(entities);
    } catch (error) {
      this.logger.error(
        `Failed to find orders for production: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to find orders: ${error.message}`);
    }
  }

  /**
   * Get status counts for dashboard
   */
  async getStatusCounts(): Promise<Record<string, number>> {
    try {
      const result = await this.orderEntityRepository
        .createQueryBuilder("order")
        .select("order.status", "status")
        .addSelect("COUNT(*)", "count")
        .groupBy("order.status")
        .getRawMany();

      // Convert to object with status as key and count as value
      const statusCounts: Record<string, number> = {};
      for (const row of result) {
        statusCounts[row.status] = parseInt(row.count, 10);
      }

      return statusCounts;
    } catch (error) {
      this.logger.error(
        `Failed to get status counts: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to get status counts: ${error.message}`);
    }
  }

  /**
   * Count total orders
   */
  async countTotal(): Promise<number> {
    try {
      return await this.orderEntityRepository.count();
    } catch (error) {
      this.logger.error(
        `Failed to count total orders: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to count orders: ${error.message}`);
    }
  }


  /**
   * Find production orders (for migration and reporting)
   */
  async findProductionOrders(filters?: any): Promise<Order[]> {
    try {
      const queryBuilder =
        this.orderEntityRepository.createQueryBuilder("order");

      if (filters?.status) {
        queryBuilder.andWhere("order.status = :status", {
          status: filters.status,
        });
      }

      if (filters?.customerId) {
        queryBuilder.andWhere("order.customerId = :customerId", {
          customerId: filters.customerId,
        });
      }

      const entities = await queryBuilder.getMany();
      return entities.map((entity) => this.orderMapper.toDomain(entity));
    } catch (error) {
      this.logger.error(
        `Failed to find production orders: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to find production orders: ${error.message}`);
    }
  }

  /**
   * Bulk create orders (for migration support)
   */
  async bulkCreate(orders: Order[]): Promise<Order[]> {
    try {
      const entities = orders.map((order) =>
        this.orderMapper.toPersistence(order),
      );
      const savedEntities = await this.orderEntityRepository.save(entities);
      return savedEntities.map((entity) => this.orderMapper.toDomain(entity));
    } catch (error) {
      this.logger.error(
        `Failed to bulk create orders: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to bulk create orders: ${error.message}`);
    }
  }

  /**
   * Get seat size summary for analytics
   */
  async getSeatSizeSummary(): Promise<any> {
    try {
      const result = await this.orderEntityRepository
        .createQueryBuilder("order")
        .select("order.seatSizes", "seatSizes")
        .addSelect("COUNT(*)", "count")
        .where("order.seatSizes IS NOT NULL")
        .groupBy("order.seatSizes")
        .getRawMany();

      return {
        summary: result,
        total: result.reduce((sum, item) => sum + parseInt(item.count, 10), 0),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get seat size summary: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to get seat size summary: ${error.message}`);
    }
  }
}
