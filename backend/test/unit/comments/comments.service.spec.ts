import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { CommentsService } from "../../../src/comments/comments.service";
import { CommentEntity } from "../../../src/comments/infrastructure/persistence/relational/entities/comment.entity";
import { CreateCommentDto } from "../../../src/comments/dto/create-comment.dto";
import { UpdateCommentDto } from "../../../src/comments/dto/update-comment.dto";

describe("CommentsService", () => {
  let service: CommentsService;
  let repository: jest.Mocked<Repository<CommentEntity>>;

  const mockComment: CommentEntity = {
    id: 1,
    orderId: 100,
    userId: 5,
    content: "This is a test comment",
    type: "general",
    isInternal: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as CommentEntity;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(CommentEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    repository = module.get(getRepositoryToken(CommentEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new comment successfully", async () => {
      // Arrange
      const createDto: CreateCommentDto = {
        orderId: 100,
        userId: 5,
        content: "Test comment",
        type: "general",
        isInternal: false,
      };

      repository.create.mockReturnValue(mockComment);
      repository.save.mockResolvedValue(mockComment);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBe("This is a test comment");
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 100,
          content: "Test comment",
        }),
      );
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw BadRequestException when orderId is missing", async () => {
      // Arrange
      const createDto: CreateCommentDto = {
        content: "Test comment",
      } as any;

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when content is empty", async () => {
      // Arrange
      const createDto: CreateCommentDto = {
        orderId: 100,
        content: "",
      };

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when content is whitespace only", async () => {
      // Arrange
      const createDto: CreateCommentDto = {
        orderId: 100,
        content: "   ",
      };

      // Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should trim content whitespace", async () => {
      // Arrange
      const createDto: CreateCommentDto = {
        orderId: 100,
        content: "  Test comment  ",
      };

      repository.create.mockReturnValue(mockComment);
      repository.save.mockResolvedValue(mockComment);

      // Act
      await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "Test comment",
        }),
      );
    });

    it("should use default type 'general' when not provided", async () => {
      // Arrange
      const createDto: CreateCommentDto = {
        orderId: 100,
        content: "Test comment",
      };

      repository.create.mockReturnValue(mockComment);
      repository.save.mockResolvedValue(mockComment);

      // Act
      await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "general",
        }),
      );
    });

    it("should use default isInternal false when not provided", async () => {
      // Arrange
      const createDto: CreateCommentDto = {
        orderId: 100,
        content: "Test comment",
      };

      repository.create.mockReturnValue(mockComment);
      repository.save.mockResolvedValue(mockComment);

      // Act
      await service.create(createDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isInternal: false,
        }),
      );
    });
  });

  describe("findAll", () => {
    it("should find comments with filters", async () => {
      // Arrange
      const queryDto = {
        getRepositoryFilters: jest.fn().mockReturnValue({
          page: 1,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "DESC",
        }),
      };

      repository.find.mockResolvedValue([mockComment]);

      // Act
      const result = await service.findAll(queryDto as any);

      // Assert
      expect(result).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: IsNull() },
        }),
      );
    });

    it("should filter by orderId", async () => {
      // Arrange
      const queryDto = {
        getRepositoryFilters: jest.fn().mockReturnValue({
          orderId: 100,
          page: 1,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "DESC",
        }),
      };

      repository.find.mockResolvedValue([mockComment]);

      // Act
      await service.findAll(queryDto as any);

      // Assert
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orderId: 100,
          }),
        }),
      );
    });

    it("should filter by userId", async () => {
      // Arrange
      const queryDto = {
        getRepositoryFilters: jest.fn().mockReturnValue({
          userId: 5,
          page: 1,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "DESC",
        }),
      };

      repository.find.mockResolvedValue([mockComment]);

      // Act
      await service.findAll(queryDto as any);

      // Assert
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 5,
          }),
        }),
      );
    });

    it("should filter by type", async () => {
      // Arrange
      const queryDto = {
        getRepositoryFilters: jest.fn().mockReturnValue({
          type: "general",
          page: 1,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "DESC",
        }),
      };

      repository.find.mockResolvedValue([mockComment]);

      // Act
      await service.findAll(queryDto as any);

      // Assert
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: "general",
          }),
        }),
      );
    });

    it("should filter by isInternal", async () => {
      // Arrange
      const queryDto = {
        getRepositoryFilters: jest.fn().mockReturnValue({
          isInternal: true,
          page: 1,
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "DESC",
        }),
      };

      repository.find.mockResolvedValue([mockComment]);

      // Act
      await service.findAll(queryDto as any);

      // Assert
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isInternal: true,
          }),
        }),
      );
    });

    it("should apply pagination", async () => {
      // Arrange
      const queryDto = {
        getRepositoryFilters: jest.fn().mockReturnValue({
          page: 2,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "DESC",
        }),
      };

      repository.find.mockResolvedValue([mockComment]);

      // Act
      await service.findAll(queryDto as any);

      // Assert
      expect(repository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should find comment by ID", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockComment);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: IsNull() },
      });
    });

    it("should throw NotFoundException when comment not found", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByOrderId", () => {
    it("should find all comments for an order", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockComment]);

      // Act
      const result = await service.findByOrderId(100);

      // Assert
      expect(result).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { orderId: 100, deletedAt: IsNull() },
        order: { createdAt: "DESC" },
      });
    });
  });

  describe("findPublicByOrderId", () => {
    it("should find only public comments for an order", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockComment]);

      // Act
      const result = await service.findPublicByOrderId(100);

      // Assert
      expect(result).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { orderId: 100, isInternal: false, deletedAt: IsNull() },
        order: { createdAt: "DESC" },
      });
    });
  });

  describe("findInternalByOrderId", () => {
    it("should find only internal comments for an order", async () => {
      // Arrange
      const internalComment = { ...mockComment, isInternal: true };
      repository.find.mockResolvedValue([internalComment] as CommentEntity[]);

      // Act
      const result = await service.findInternalByOrderId(100);

      // Assert
      expect(result).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { orderId: 100, isInternal: true, deletedAt: IsNull() },
        order: { createdAt: "DESC" },
      });
    });
  });

  describe("findByUserId", () => {
    it("should find all comments by a user", async () => {
      // Arrange
      repository.find.mockResolvedValue([mockComment]);

      // Act
      const result = await service.findByUserId(5);

      // Assert
      expect(result).toHaveLength(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: 5, deletedAt: IsNull() },
        order: { createdAt: "DESC" },
      });
    });
  });

  describe("update", () => {
    it("should update comment successfully", async () => {
      // Arrange
      const updateDto: UpdateCommentDto = {
        content: "Updated content",
        type: "note",
      };

      const updatedComment = {
        ...mockComment,
        content: "Updated content",
        type: "note",
      };

      repository.findOne.mockResolvedValue(mockComment);
      repository.save.mockResolvedValue(updatedComment as CommentEntity);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(result.content).toBe("Updated content");
      expect(repository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when comment not found", async () => {
      // Arrange
      const updateDto: UpdateCommentDto = {
        content: "Updated content",
      };

      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when updating to empty content", async () => {
      // Arrange
      const updateDto: UpdateCommentDto = {
        content: "   ",
      };

      repository.findOne.mockResolvedValue(mockComment);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("should trim content when updating", async () => {
      // Arrange
      const updateDto: UpdateCommentDto = {
        content: "  Updated content  ",
      };

      repository.findOne.mockResolvedValue(mockComment);
      repository.save.mockResolvedValue(mockComment);

      // Act
      await service.update(1, updateDto);

      // Assert
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "Updated content",
        }),
      );
    });

    it("should update only provided fields", async () => {
      // Arrange
      const updateDto: UpdateCommentDto = {
        isInternal: true,
      };

      repository.findOne.mockResolvedValue(mockComment);
      repository.save.mockResolvedValue(mockComment);

      // Act
      await service.update(1, updateDto);

      // Assert
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isInternal: true,
        }),
      );
    });
  });

  describe("remove", () => {
    it("should soft delete comment successfully", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockComment);
      repository.softDelete.mockResolvedValue({ affected: 1, raw: [] } as any);

      // Act
      await service.remove(1);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: IsNull() },
      });
      expect(repository.softDelete).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException when comment not found", async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe("getCommentCount", () => {
    it("should return comment count for an order", async () => {
      // Arrange
      repository.count.mockResolvedValue(5);

      // Act
      const result = await service.getCommentCount(100);

      // Assert
      expect(result).toBe(5);
      expect(repository.count).toHaveBeenCalledWith({
        where: { orderId: 100, deletedAt: IsNull() },
      });
    });

    it("should return 0 when no comments found", async () => {
      // Arrange
      repository.count.mockResolvedValue(0);

      // Act
      const result = await service.getCommentCount(999);

      // Assert
      expect(result).toBe(0);
    });
  });

  describe("getCommentStats", () => {
    it("should return comment statistics for an order", async () => {
      // Arrange
      const comments = [
        { ...mockComment, isInternal: false, type: "general" },
        { ...mockComment, id: 2, isInternal: true, type: "note" },
        { ...mockComment, id: 3, isInternal: false, type: "general" },
      ];

      repository.find.mockResolvedValue(comments as CommentEntity[]);

      // Act
      const result = await service.getCommentStats(100);

      // Assert
      expect(result).toEqual({
        total: 3,
        internal: 1,
        public: 2,
        byType: {
          general: 2,
          note: 1,
        },
      });
    });

    it("should return zero stats when no comments found", async () => {
      // Arrange
      repository.find.mockResolvedValue([]);

      // Act
      const result = await service.getCommentStats(999);

      // Assert
      expect(result).toEqual({
        total: 0,
        internal: 0,
        public: 0,
        byType: {},
      });
    });
  });

  describe("bulkCreate", () => {
    it("should bulk create comments successfully", async () => {
      // Arrange
      const createDtos: CreateCommentDto[] = [
        {
          orderId: 100,
          content: "Comment 1",
        },
        {
          orderId: 100,
          content: "Comment 2",
          isInternal: true,
        },
      ];

      const comments = [
        { ...mockComment, id: 1 },
        { ...mockComment, id: 2, isInternal: true },
      ];

      repository.create.mockImplementation((dto) => dto as CommentEntity);
      repository.save.mockResolvedValue(comments as any);

      // Act
      const result = await service.bulkCreate(createDtos);

      // Assert
      expect(result).toHaveLength(2);
      expect(repository.create).toHaveBeenCalledTimes(2);
      expect(repository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ orderId: 100 }),
          expect.objectContaining({ orderId: 100 }),
        ]),
      );
    });

    it("should handle empty array", async () => {
      // Arrange
      repository.save.mockResolvedValue([] as any);

      // Act
      const result = await service.bulkCreate([]);

      // Assert
      expect(result).toEqual([]);
      expect(repository.save).toHaveBeenCalledWith([]);
    });
  });
});
