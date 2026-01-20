import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderLineEntity } from "./infrastructure/persistence/relational/entities/order-line.entity";
import { CreateOrderLineDto } from "./dto/create-order-line.dto";
import { UpdateOrderLineDto } from "./dto/update-order-line.dto";
import { QueryOrderLineDto } from "./dto/query-order-line.dto";
import { OrderLineDto } from "./dto/order-line.dto";

/**
 * OrderLine Application Service
 *
 * Handles business logic for order line items including CRUD operations,
 * order association, and pricing calculations.
 */
@Injectable()
export class OrderLineService {
  constructor(
    @InjectRepository(OrderLineEntity)
    private readonly orderLineRepository: Repository<OrderLineEntity>,
  ) {}

  /**
   * Create a new order line
   */
  async create(createDto: CreateOrderLineDto): Promise<OrderLineDto> {
    const orderLine = this.orderLineRepository.create({
      orderId: createDto.orderId,
      productId: createDto.productId || null,
      quantity: createDto.quantity || 1,
      unitPrice: createDto.unitPrice,
      totalPrice: createDto.totalPrice,
      notes: createDto.notes || null,
      sequence: createDto.sequence || 0,
    });

    const saved = await this.orderLineRepository.save(orderLine);
    return this.mapToDto(saved);
  }

  /**
   * Find order line by ID
   */
  async findOne(id: number): Promise<OrderLineDto> {
    const orderLine = await this.orderLineRepository.findOne({
      where: { id },
    });

    if (!orderLine) {
      throw new NotFoundException("Order line not found");
    }

    return this.mapToDto(orderLine);
  }

  /**
   * Find all order lines with filtering and pagination
   */
  async findAll(queryDto: QueryOrderLineDto): Promise<{
    data: OrderLineDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      sortBy = "sequence",
      sortOrder = "ASC",
      orderId,
      productId,
    } = queryDto;

    const queryBuilder = this.orderLineRepository
      .createQueryBuilder("orderLine")
      .where("orderLine.deletedAt IS NULL");

    if (orderId) {
      queryBuilder.andWhere("orderLine.orderId = :orderId", { orderId });
    }

    if (productId) {
      queryBuilder.andWhere("orderLine.productId = :productId", { productId });
    }

    const total = await queryBuilder.getCount();

    const orderLines = await queryBuilder
      .orderBy(`orderLine.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: orderLines.map((ol) => this.mapToDto(ol)),
      total,
      page,
      limit,
    };
  }

  /**
   * Find all order lines by order ID
   */
  async findByOrderId(orderId: number): Promise<OrderLineDto[]> {
    const orderLines = await this.orderLineRepository.find({
      where: { orderId },
      order: { sequence: "ASC" },
    });

    return orderLines.map((ol) => this.mapToDto(ol));
  }

  /**
   * Find all order lines by product ID
   */
  async findByProductId(productId: number): Promise<OrderLineDto[]> {
    const orderLines = await this.orderLineRepository.find({
      where: { productId },
      order: { createdAt: "DESC" },
    });

    return orderLines.map((ol) => this.mapToDto(ol));
  }

  /**
   * Update order line
   */
  async update(
    id: number,
    updateDto: UpdateOrderLineDto,
  ): Promise<OrderLineDto> {
    const orderLine = await this.orderLineRepository.findOne({
      where: { id },
    });

    if (!orderLine) {
      throw new NotFoundException("Order line not found");
    }

    if (updateDto.productId !== undefined) {
      orderLine.productId = updateDto.productId || null;
    }

    if (updateDto.quantity !== undefined) {
      orderLine.quantity = updateDto.quantity;
    }

    if (updateDto.unitPrice !== undefined) {
      orderLine.unitPrice = updateDto.unitPrice;
    }

    if (updateDto.totalPrice !== undefined) {
      orderLine.totalPrice = updateDto.totalPrice;
    }

    if (updateDto.notes !== undefined) {
      orderLine.notes = updateDto.notes;
    }

    if (updateDto.sequence !== undefined) {
      orderLine.sequence = updateDto.sequence;
    }

    const saved = await this.orderLineRepository.save(orderLine);
    return this.mapToDto(saved);
  }

  /**
   * Remove order line (soft delete)
   */
  async remove(id: number): Promise<void> {
    const orderLine = await this.orderLineRepository.findOne({
      where: { id },
    });

    if (!orderLine) {
      throw new NotFoundException("Order line not found");
    }

    await this.orderLineRepository.softDelete(id);
  }

  /**
   * Calculate total for order lines
   */
  async calculateOrderTotal(orderId: number): Promise<number> {
    const result = await this.orderLineRepository
      .createQueryBuilder("orderLine")
      .select("SUM(orderLine.totalPrice)", "total")
      .where("orderLine.orderId = :orderId", { orderId })
      .andWhere("orderLine.deletedAt IS NULL")
      .getRawOne();

    return parseFloat(result?.total || "0");
  }

  /**
   * Resequence order lines
   */
  async resequence(
    orderId: number,
    lineIds: number[],
  ): Promise<OrderLineDto[]> {
    const orderLines = await this.orderLineRepository.find({
      where: { orderId },
    });

    if (orderLines.length !== lineIds.length) {
      throw new BadRequestException(
        "Line IDs do not match existing order lines",
      );
    }

    for (let i = 0; i < lineIds.length; i++) {
      const orderLine = orderLines.find((ol) => ol.id === lineIds[i]);
      if (orderLine) {
        orderLine.sequence = i;
        await this.orderLineRepository.save(orderLine);
      }
    }

    return this.findByOrderId(orderId);
  }

  /**
   * Bulk create order lines
   */
  async bulkCreate(createDtos: CreateOrderLineDto[]): Promise<OrderLineDto[]> {
    const orderLines = createDtos.map((dto) =>
      this.orderLineRepository.create({
        orderId: dto.orderId,
        productId: dto.productId || null,
        quantity: dto.quantity || 1,
        unitPrice: dto.unitPrice,
        totalPrice: dto.totalPrice,
        notes: dto.notes || null,
        sequence: dto.sequence || 0,
      }),
    );

    const saved = await this.orderLineRepository.save(orderLines);
    return saved.map((ol) => this.mapToDto(ol));
  }

  /**
   * Map entity to DTO
   */
  private mapToDto(entity: OrderLineEntity): OrderLineDto {
    return {
      id: entity.id,
      orderId: entity.orderId,
      productId: entity.productId,
      quantity: entity.quantity,
      unitPrice: entity.unitPrice,
      totalPrice: entity.totalPrice,
      notes: entity.notes,
      sequence: entity.sequence,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
