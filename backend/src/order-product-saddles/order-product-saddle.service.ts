import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere } from "typeorm";
import { OrderProductSaddleEntity } from "./infrastructure/persistence/relational/entities/order-product-saddle.entity";
import { CreateOrderProductSaddleDto } from "./dto/create-order-product-saddle.dto";
import { UpdateOrderProductSaddleDto } from "./dto/update-order-product-saddle.dto";
import { QueryOrderProductSaddleDto } from "./dto/query-order-product-saddle.dto";
import { OrderProductSaddleDto } from "./dto/order-product-saddle.dto";

/**
 * OrderProductSaddle Application Service
 *
 * Manages the relationship between orders and products (saddles).
 * Handles CRUD operations, filtering, and business logic for order-product associations.
 */
@Injectable()
export class OrderProductSaddleService {
  constructor(
    @InjectRepository(OrderProductSaddleEntity)
    private readonly orderProductSaddleRepository: Repository<OrderProductSaddleEntity>,
  ) {}

  /**
   * Create a new order-product-saddle relationship
   */
  async create(
    createDto: CreateOrderProductSaddleDto,
  ): Promise<OrderProductSaddleDto> {
    // Validate orderId and productId exist (basic validation)
    if (!createDto.orderId || !createDto.productId) {
      throw new BadRequestException("Both orderId and productId are required");
    }

    const entity = this.orderProductSaddleRepository.create({
      orderId: createDto.orderId,
      productId: createDto.productId,
      serial: createDto.serial || null,
      configuration: createDto.configuration || null,
      quantity: createDto.quantity || 1,
      notes: createDto.notes || null,
      sequence: createDto.sequence || 0,
    });

    const saved = await this.orderProductSaddleRepository.save(entity);
    return this.mapToDto(saved);
  }

  /**
   * Find all order-product-saddle relationships with optional filtering
   */
  async findAll(
    queryDto: QueryOrderProductSaddleDto,
  ): Promise<OrderProductSaddleDto[]> {
    const where: FindOptionsWhere<OrderProductSaddleEntity> = {};

    if (queryDto.orderId) {
      where.orderId = queryDto.orderId;
    }

    if (queryDto.productId) {
      where.productId = queryDto.productId;
    }

    if (queryDto.serial) {
      where.serial = queryDto.serial;
    }

    const entities = await this.orderProductSaddleRepository.find({
      where,
      order: {
        [queryDto.getSortBy()]: queryDto.getSortOrder(),
      },
      skip: queryDto.getOffset(),
      take: queryDto.getLimit(),
    });

    return entities.map((entity) => this.mapToDto(entity));
  }

  /**
   * Find a single order-product-saddle by ID
   */
  async findOne(id: number): Promise<OrderProductSaddleDto> {
    const entity = await this.orderProductSaddleRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException("Order-product relationship not found");
    }

    return this.mapToDto(entity);
  }

  /**
   * Find all products for a specific order
   */
  async findByOrderId(orderId: number): Promise<OrderProductSaddleDto[]> {
    const entities = await this.orderProductSaddleRepository.find({
      where: { orderId },
      order: { sequence: "ASC" },
    });

    return entities.map((entity) => this.mapToDto(entity));
  }

  /**
   * Find all orders for a specific product
   */
  async findByProductId(productId: number): Promise<OrderProductSaddleDto[]> {
    const entities = await this.orderProductSaddleRepository.find({
      where: { productId },
      order: { createdAt: "DESC" },
    });

    return entities.map((entity) => this.mapToDto(entity));
  }

  /**
   * Update an order-product-saddle relationship
   */
  async update(
    id: number,
    updateDto: UpdateOrderProductSaddleDto,
  ): Promise<OrderProductSaddleDto> {
    const entity = await this.orderProductSaddleRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException("Order-product relationship not found");
    }

    // Update fields if provided
    if (updateDto.serial !== undefined) {
      entity.serial = updateDto.serial || null;
    }

    if (updateDto.configuration !== undefined) {
      entity.configuration = updateDto.configuration || null;
    }

    if (updateDto.quantity !== undefined) {
      entity.quantity = updateDto.quantity;
    }

    if (updateDto.notes !== undefined) {
      entity.notes = updateDto.notes || null;
    }

    if (updateDto.sequence !== undefined) {
      entity.sequence = updateDto.sequence;
    }

    const saved = await this.orderProductSaddleRepository.save(entity);
    return this.mapToDto(saved);
  }

  /**
   * Delete an order-product-saddle relationship (soft delete)
   */
  async remove(id: number): Promise<void> {
    const entity = await this.orderProductSaddleRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException("Order-product relationship not found");
    }

    await this.orderProductSaddleRepository.softDelete(id);
  }

  /**
   * Count total products for an order
   */
  async countByOrderId(orderId: number): Promise<number> {
    return this.orderProductSaddleRepository.count({
      where: { orderId },
    });
  }

  /**
   * Get total quantity for an order
   */
  async getTotalQuantityByOrderId(orderId: number): Promise<number> {
    const entities = await this.orderProductSaddleRepository.find({
      where: { orderId },
    });

    return entities.reduce((total, entity) => total + entity.quantity, 0);
  }

  /**
   * Bulk create order-product-saddle relationships
   */
  async bulkCreate(
    createDtos: CreateOrderProductSaddleDto[],
  ): Promise<OrderProductSaddleDto[]> {
    const entities = createDtos.map((dto) =>
      this.orderProductSaddleRepository.create({
        orderId: dto.orderId,
        productId: dto.productId,
        serial: dto.serial || null,
        configuration: dto.configuration || null,
        quantity: dto.quantity || 1,
        notes: dto.notes || null,
        sequence: dto.sequence || 0,
      }),
    );

    const saved = await this.orderProductSaddleRepository.save(entities);
    return saved.map((entity) => this.mapToDto(entity));
  }

  /**
   * Map entity to DTO
   */
  private mapToDto(entity: OrderProductSaddleEntity): OrderProductSaddleDto {
    return {
      id: entity.id,
      orderId: entity.orderId,
      productId: entity.productId,
      serial: entity.serial,
      configuration: entity.configuration,
      quantity: entity.quantity,
      notes: entity.notes,
      sequence: entity.sequence,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
