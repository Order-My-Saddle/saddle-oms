import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { OrderEntity } from "./infrastructure/persistence/relational/entities/order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrderDto } from "./dto/order.dto";

/**
 * Order Application Service
 *
 * Manages order operations. This service bridges the new CreateOrderDto schema
 * with the existing OrderEntity structure.
 */
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  /**
   * Create a new order
   */
  async create(createOrderDto: CreateOrderDto): Promise<OrderDto> {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Build saddle specifications from CreateOrderDto fields
    const saddleSpecifications: Record<string, any> = {
      saddleId: createOrderDto.saddleId,
      leatherId: createOrderDto.leatherId,
      horseName: createOrderDto.horseName,
      fitterReference: createOrderDto.fitterReference,
      specialNotes: createOrderDto.specialNotes,
      orderData: createOrderDto.orderData,
    };

    const order = this.orderRepository.create({
      customerId: createOrderDto.customerId || 0, // Will be auto-generated if not provided
      orderNumber,
      status: "pending",
      priority: createOrderDto.rushed === 1 ? "urgent" : "normal",
      fitterId: createOrderDto.fitterId || null,
      factoryId: createOrderDto.factoryId || null,
      saddleSpecifications,
      specialInstructions: createOrderDto.specialNotes,
      totalAmount: (createOrderDto.priceSaddle || 0) / 100, // Convert from cents
      depositPaid: (createOrderDto.priceDeposit || 0) / 100,
      balanceOwing: ((createOrderDto.priceSaddle || 0) - (createOrderDto.priceDeposit || 0)) / 100,
      isUrgent: createOrderDto.rushed === 1,
      customerName: createOrderDto.name,
      saddleId: createOrderDto.saddleId || null,
    });

    const savedOrder = await this.orderRepository.save(order);

    return this.toDto(savedOrder);
  }

  /**
   * Find order by ID
   */
  async findOne(id: number): Promise<OrderDto> {
    const order = await this.orderRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return this.toDto(order);
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<OrderDto> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber, deletedAt: IsNull() },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return this.toDto(order);
  }

  /**
   * Find all orders with filtering and pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    fitterId?: number,
    customerId?: number,
    factoryId?: number,
    status?: string,
  ): Promise<{ data: OrderDto[]; total: number; pages: number }> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder("order")
      .where("order.deletedAt IS NULL");

    if (fitterId) {
      queryBuilder.andWhere("order.fitterId = :fitterId", { fitterId });
    }

    if (customerId) {
      queryBuilder.andWhere("order.customerId = :customerId", { customerId });
    }

    if (factoryId) {
      queryBuilder.andWhere("order.factoryId = :factoryId", { factoryId });
    }

    if (status) {
      queryBuilder.andWhere("order.status = :status", { status });
    }

    queryBuilder.orderBy("order.createdAt", "DESC");

    const total = await queryBuilder.getCount();
    const orders = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: orders.map((order) => this.toDto(order)),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update order
   */
  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<OrderDto> {
    const order = await this.orderRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    // Update relevant fields based on UpdateOrderDto
    if (updateOrderDto.fitterId !== undefined) {
      order.fitterId = updateOrderDto.fitterId || null;
    }
    if (updateOrderDto.factoryId !== undefined) {
      order.factoryId = updateOrderDto.factoryId || null;
    }
    if (updateOrderDto.status !== undefined) {
      order.status = updateOrderDto.status;
    }
    if (updateOrderDto.priority !== undefined) {
      order.priority = updateOrderDto.priority;
      order.isUrgent = ["urgent", "critical"].includes(updateOrderDto.priority);
    }
    if (updateOrderDto.specialInstructions !== undefined) {
      order.specialInstructions = updateOrderDto.specialInstructions;
    }
    if (updateOrderDto.saddleSpecifications !== undefined) {
      order.saddleSpecifications = updateOrderDto.saddleSpecifications;
    }
    if (updateOrderDto.estimatedDeliveryDate !== undefined) {
      order.estimatedDeliveryDate = updateOrderDto.estimatedDeliveryDate;
    }
    if (updateOrderDto.totalAmount !== undefined) {
      order.totalAmount = updateOrderDto.totalAmount;
    }
    if (updateOrderDto.additionalDeposit !== undefined && updateOrderDto.additionalDeposit > 0) {
      order.depositPaid = (order.depositPaid || 0) + updateOrderDto.additionalDeposit;
      order.balanceOwing = order.totalAmount - order.depositPaid;
    }
    if (updateOrderDto.measurements !== undefined) {
      order.measurements = updateOrderDto.measurements;
    }

    const savedOrder = await this.orderRepository.save(order);

    return this.toDto(savedOrder);
  }

  /**
   * Remove order (soft delete)
   */
  async remove(id: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    await this.orderRepository.softDelete(id);
  }

  /**
   * Find orders by fitter ID
   */
  async findByFitterId(fitterId: number): Promise<OrderDto[]> {
    const orders = await this.orderRepository.find({
      where: { fitterId, deletedAt: IsNull() },
      order: { createdAt: "DESC" },
    });
    return orders.map((order) => this.toDto(order));
  }

  /**
   * Find orders by customer ID
   */
  async findByCustomerId(customerId: number): Promise<OrderDto[]> {
    const orders = await this.orderRepository.find({
      where: { customerId, deletedAt: IsNull() },
      order: { createdAt: "DESC" },
    });
    return orders.map((order) => this.toDto(order));
  }

  /**
   * Find orders by factory ID
   */
  async findByFactoryId(factoryId: number): Promise<OrderDto[]> {
    const orders = await this.orderRepository.find({
      where: { factoryId, deletedAt: IsNull() },
      order: { createdAt: "DESC" },
    });
    return orders.map((order) => this.toDto(order));
  }

  /**
   * Find urgent orders
   */
  async findUrgentOrders(): Promise<OrderDto[]> {
    const orders = await this.orderRepository.find({
      where: { isUrgent: true, deletedAt: IsNull() },
      order: { createdAt: "DESC" },
    });
    return orders.map((order) => this.toDto(order));
  }

  /**
   * Cancel order
   */
  async cancel(id: number, reason: string): Promise<OrderDto> {
    const order = await this.orderRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    order.status = "cancelled";
    order.specialInstructions = `${order.specialInstructions || ""}\n\nCancellation reason: ${reason}`.trim();

    const savedOrder = await this.orderRepository.save(order);
    return this.toDto(savedOrder);
  }

  /**
   * Find overdue orders
   */
  async findOverdueOrders(): Promise<OrderDto[]> {
    const now = new Date();
    const orders = await this.orderRepository
      .createQueryBuilder("order")
      .where("order.deletedAt IS NULL")
      .andWhere("order.estimatedDeliveryDate < :now", { now })
      .andWhere("order.status NOT IN (:...completedStatuses)", {
        completedStatuses: ["delivered", "cancelled", "returned"],
      })
      .orderBy("order.estimatedDeliveryDate", "ASC")
      .getMany();
    return orders.map((order) => this.toDto(order));
  }

  /**
   * Find orders in production
   */
  async findOrdersInProduction(): Promise<OrderDto[]> {
    const orders = await this.orderRepository.find({
      where: { status: "in_production", deletedAt: IsNull() },
      order: { createdAt: "DESC" },
    });
    return orders.map((order) => this.toDto(order));
  }

  /**
   * Find orders for production scheduling
   */
  async findOrdersForProduction(limit?: number): Promise<OrderDto[]> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder("order")
      .where("order.deletedAt IS NULL")
      .andWhere("order.status IN (:...productionStatuses)", {
        productionStatuses: ["confirmed", "in_production", "quality_control"],
      })
      .orderBy("order.isUrgent", "DESC")
      .addOrderBy("order.createdAt", "ASC");

    if (limit) {
      queryBuilder.take(limit);
    }

    const orders = await queryBuilder.getMany();
    return orders.map((order) => this.toDto(order));
  }

  /**
   * Find orders requiring deposit
   */
  async findOrdersRequiringDeposit(): Promise<OrderDto[]> {
    const orders = await this.orderRepository
      .createQueryBuilder("order")
      .where("order.deletedAt IS NULL")
      .andWhere("order.balanceOwing > 0")
      .andWhere("order.status NOT IN (:...completedStatuses)", {
        completedStatuses: ["delivered", "cancelled", "returned"],
      })
      .orderBy("order.balanceOwing", "DESC")
      .getMany();
    return orders.map((order) => this.toDto(order));
  }

  /**
   * Get customer order summary
   */
  async getCustomerOrderSummary(customerId: number): Promise<{
    orderCount: number;
    totalValue: number;
  }> {
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .where("order.customerId = :customerId", { customerId })
      .andWhere("order.deletedAt IS NULL")
      .select("COUNT(*)", "count")
      .addSelect("COALESCE(SUM(order.totalAmount), 0)", "total")
      .getRawOne();

    return {
      orderCount: parseInt(result.count, 10) || 0,
      totalValue: parseFloat(result.total) || 0,
    };
  }

  /**
   * Get order statistics
   */
  async getOrderStats(): Promise<{
    totalOrders: number;
    urgentOrders: number;
    overdueOrders: number;
    averageValue: number;
    statusCounts: Record<string, number>;
  }> {
    const totalOrders = await this.orderRepository.count({
      where: { deletedAt: IsNull() },
    });
    const urgentOrders = await this.orderRepository.count({
      where: { isUrgent: true, deletedAt: IsNull() },
    });

    const now = new Date();
    const overdueOrders = await this.orderRepository
      .createQueryBuilder("order")
      .where("order.deletedAt IS NULL")
      .andWhere("order.estimatedDeliveryDate < :now", { now })
      .andWhere("order.status NOT IN (:...completedStatuses)", {
        completedStatuses: ["delivered", "cancelled", "returned"],
      })
      .getCount();

    const avgResult = await this.orderRepository
      .createQueryBuilder("order")
      .where("order.deletedAt IS NULL")
      .select("AVG(order.totalAmount)", "avg")
      .getRawOne();
    const averageValue = parseFloat(avgResult?.avg) || 0;

    const statusResults = await this.orderRepository
      .createQueryBuilder("order")
      .where("order.deletedAt IS NULL")
      .select("order.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("order.status")
      .getRawMany();

    const statusCounts: Record<string, number> = {};
    statusResults.forEach((row) => {
      statusCounts[row.status] = parseInt(row.count, 10);
    });

    return { totalOrders, urgentOrders, overdueOrders, averageValue, statusCounts };
  }

  /**
   * Convert entity to DTO
   */
  private toDto(order: OrderEntity): OrderDto {
    const dto = new OrderDto();
    dto.id = order.id;
    dto.customerId = order.customerId;
    dto.orderNumber = order.orderNumber;
    dto.status = order.status;
    dto.priority = order.priority;
    dto.fitterId = order.fitterId;
    dto.factoryId = order.factoryId;
    dto.saddleSpecifications = order.saddleSpecifications;
    dto.specialInstructions = order.specialInstructions;
    dto.estimatedDeliveryDate = order.estimatedDeliveryDate;
    dto.actualDeliveryDate = order.actualDeliveryDate;
    dto.totalAmount = order.totalAmount;
    dto.depositPaid = order.depositPaid;
    dto.balanceOwing = order.balanceOwing;
    dto.measurements = order.measurements;
    dto.isUrgent = order.isUrgent;
    dto.seatSizes = order.seatSizes;
    dto.customerName = order.customerName;
    dto.saddleId = order.saddleId;
    dto.isOverdue = order.estimatedDeliveryDate
      ? new Date() > order.estimatedDeliveryDate
      : false;
    dto.daysUntilDelivery = order.estimatedDeliveryDate
      ? Math.ceil(
          (order.estimatedDeliveryDate.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        )
      : null;
    dto.paymentPercentage =
      order.totalAmount > 0
        ? (order.depositPaid / order.totalAmount) * 100
        : 0;
    dto.createdAt = order.createdAt;
    dto.updatedAt = order.updatedAt;
    return dto;
  }
}
