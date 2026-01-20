import { ApiProperty } from "@nestjs/swagger";

/**
 * Comment Data Transfer Object
 *
 * Represents a comment in API responses.
 * Uses INTEGER IDs to match current schema.
 */
export class CommentDto {
  @ApiProperty({
    description: "Comment ID",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "Order ID",
    example: 12345,
  })
  orderId: number;

  @ApiProperty({
    description: "User ID who created the comment",
    example: 42,
    nullable: true,
  })
  userId: number | null;

  @ApiProperty({
    description: "Comment content",
    example: "Customer requested color change to black leather",
  })
  content: string;

  @ApiProperty({
    description: "Comment type/category",
    example: "general",
    enum: ["general", "production", "customer", "internal", "status_change"],
  })
  type: string;

  @ApiProperty({
    description: "Whether this is an internal comment",
    example: false,
  })
  isInternal: boolean;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-15T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-15T14:20:00Z",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "Deletion timestamp (null if not deleted)",
    example: null,
    nullable: true,
  })
  deletedAt: Date | null;
}
