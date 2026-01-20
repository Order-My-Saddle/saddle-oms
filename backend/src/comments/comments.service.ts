import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, IsNull } from "typeorm";
import { CommentEntity } from "./infrastructure/persistence/relational/entities/comment.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { QueryCommentDto } from "./dto/query-comment.dto";
import { CommentDto } from "./dto/comment.dto";

/**
 * Comment Application Service
 *
 * Handles all comment-related business logic including CRUD operations,
 * order-specific comment retrieval, and comment filtering.
 */
@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
  ) {}

  /**
   * Create a new comment
   */
  async create(createCommentDto: CreateCommentDto): Promise<CommentDto> {
    // Validate required fields
    if (!createCommentDto.orderId) {
      throw new BadRequestException("Order ID is required");
    }

    if (!createCommentDto.content || createCommentDto.content.trim() === "") {
      throw new BadRequestException("Comment content is required");
    }

    const comment = this.commentRepository.create({
      orderId: createCommentDto.orderId,
      userId: createCommentDto.userId || null,
      content: createCommentDto.content.trim(),
      type: createCommentDto.type || "general",
      isInternal: createCommentDto.isInternal || false,
    });

    const savedComment = await this.commentRepository.save(comment);

    return this.mapToDto(savedComment);
  }

  /**
   * Find all comments with filtering and pagination
   */
  async findAll(queryDto: QueryCommentDto): Promise<CommentDto[]> {
    const filters = queryDto.getRepositoryFilters();
    const where: FindOptionsWhere<CommentEntity> = {
      deletedAt: IsNull(),
    };

    if (filters.orderId) {
      where.orderId = filters.orderId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isInternal !== undefined) {
      where.isInternal = filters.isInternal;
    }

    const skip = (filters.page - 1) * filters.limit;

    const comments = await this.commentRepository.find({
      where,
      order: {
        [filters.sortBy]: filters.sortOrder,
      },
      skip,
      take: filters.limit,
    });

    return comments.map((comment) => this.mapToDto(comment));
  }

  /**
   * Find a single comment by ID
   */
  async findOne(id: number): Promise<CommentDto> {
    const comment = await this.commentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return this.mapToDto(comment);
  }

  /**
   * Find all comments for a specific order
   */
  async findByOrderId(orderId: number): Promise<CommentDto[]> {
    const comments = await this.commentRepository.find({
      where: {
        orderId,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: "DESC",
      },
    });

    return comments.map((comment) => this.mapToDto(comment));
  }

  /**
   * Find all public (non-internal) comments for an order
   */
  async findPublicByOrderId(orderId: number): Promise<CommentDto[]> {
    const comments = await this.commentRepository.find({
      where: {
        orderId,
        isInternal: false,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: "DESC",
      },
    });

    return comments.map((comment) => this.mapToDto(comment));
  }

  /**
   * Find all internal comments for an order
   */
  async findInternalByOrderId(orderId: number): Promise<CommentDto[]> {
    const comments = await this.commentRepository.find({
      where: {
        orderId,
        isInternal: true,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: "DESC",
      },
    });

    return comments.map((comment) => this.mapToDto(comment));
  }

  /**
   * Find comments by user ID
   */
  async findByUserId(userId: number): Promise<CommentDto[]> {
    const comments = await this.commentRepository.find({
      where: {
        userId,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: "DESC",
      },
    });

    return comments.map((comment) => this.mapToDto(comment));
  }

  /**
   * Update a comment
   */
  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentDto> {
    const comment = await this.commentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    // Update only provided fields
    if (updateCommentDto.content !== undefined) {
      if (updateCommentDto.content.trim() === "") {
        throw new BadRequestException("Comment content cannot be empty");
      }
      comment.content = updateCommentDto.content.trim();
    }

    if (updateCommentDto.type !== undefined) {
      comment.type = updateCommentDto.type;
    }

    if (updateCommentDto.isInternal !== undefined) {
      comment.isInternal = updateCommentDto.isInternal;
    }

    if (updateCommentDto.userId !== undefined) {
      comment.userId = updateCommentDto.userId;
    }

    const updatedComment = await this.commentRepository.save(comment);

    return this.mapToDto(updatedComment);
  }

  /**
   * Delete a comment (soft delete)
   */
  async remove(id: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    await this.commentRepository.softDelete(id);
  }

  /**
   * Get comment count for an order
   */
  async getCommentCount(orderId: number): Promise<number> {
    return this.commentRepository.count({
      where: {
        orderId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Get comment statistics for an order
   */
  async getCommentStats(orderId: number): Promise<{
    total: number;
    internal: number;
    public: number;
    byType: Record<string, number>;
  }> {
    const comments = await this.commentRepository.find({
      where: {
        orderId,
        deletedAt: IsNull(),
      },
    });

    const stats = {
      total: comments.length,
      internal: comments.filter((c) => c.isInternal).length,
      public: comments.filter((c) => !c.isInternal).length,
      byType: {} as Record<string, number>,
    };

    // Count by type
    comments.forEach((comment) => {
      stats.byType[comment.type] = (stats.byType[comment.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Bulk create comments (for migration support)
   */
  async bulkCreate(commentsData: CreateCommentDto[]): Promise<CommentDto[]> {
    const comments = commentsData.map((data) =>
      this.commentRepository.create({
        orderId: data.orderId,
        userId: data.userId || null,
        content: data.content.trim(),
        type: data.type || "general",
        isInternal: data.isInternal || false,
      }),
    );

    const savedComments = await this.commentRepository.save(comments);

    return savedComments.map((comment) => this.mapToDto(comment));
  }

  /**
   * Map entity to DTO
   */
  private mapToDto(entity: CommentEntity): CommentDto {
    return {
      id: entity.id,
      orderId: entity.orderId,
      userId: entity.userId,
      content: entity.content,
      type: entity.type,
      isInternal: entity.isInternal,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
