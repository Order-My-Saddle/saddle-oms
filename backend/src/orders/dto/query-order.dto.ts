import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BaseQueryDto } from "../../common/dto/base-query.dto";
import { FilterOrderDto } from "./filter-order.dto";

/**
 * Query Order Data Transfer Object
 *
 * Extends BaseQueryDto with order-specific filtering options.
 * Supports both OData-style queries and legacy parameter formats.
 */
export class QueryOrderDto extends BaseQueryDto {
  @ApiProperty({
    description: "Order-specific filters",
    type: FilterOrderDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterOrderDto)
  filters?: FilterOrderDto;

  // Legacy parameter support
  @ApiProperty({
    description: "Legacy: Filter by customer ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsOptional()
  customerId?: string;

  @ApiProperty({
    description: "Legacy: Filter by order status",
    example: "pending",
    required: false,
  })
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: "Legacy: Filter by priority",
    example: "urgent",
    required: false,
  })
  @IsOptional()
  priority?: string;

  @ApiProperty({
    description: "Legacy: Filter by fitter ID",
    example: "789e0123-e45b-67c8-d901-234567890abc",
    required: false,
  })
  @IsOptional()
  fitterId?: string;

  @ApiProperty({
    description: "Legacy: Filter by factory ID",
    example: "456e7890-b12c-34d5-e678-901234567def",
    required: false,
  })
  @IsOptional()
  factoryId?: string;

  @ApiProperty({
    description: "Legacy: Filter urgent orders",
    example: "true",
    required: false,
  })
  @IsOptional()
  urgent?: string;

  @ApiProperty({
    description: "Legacy: Filter overdue orders",
    example: "false",
    required: false,
  })
  @IsOptional()
  overdue?: string;

  /**
   * Get order-specific filters with legacy parameter fallback
   */
  getOrderFilters(): FilterOrderDto {
    const filters = this.filters || new FilterOrderDto();

    // Apply legacy parameters as fallback
    if (this.customerId && !filters.customerId) {
      filters.customerId = this.customerId;
    }

    if (this.status && !filters.status) {
      filters.status = this.status;
    }

    if (this.priority && !filters.priority) {
      filters.priority = this.priority;
    }

    if (this.fitterId && !filters.fitterId) {
      filters.fitterId = this.fitterId;
    }

    if (this.factoryId && !filters.factoryId) {
      filters.factoryId = this.factoryId;
    }

    if (this.urgent && filters.isUrgent === undefined) {
      filters.isUrgent = this.urgent.toLowerCase() === "true";
    }

    if (this.overdue && filters.overdue === undefined) {
      filters.overdue = this.overdue.toLowerCase() === "true";
    }

    return filters;
  }

  /**
   * Get repository-compatible filter object
   */
  getRepositoryFilters() {
    const filters = this.getOrderFilters();

    return {
      customerId: filters.customerId,
      fitterId: filters.fitterId,
      factoryId: filters.factoryId,
      status: filters.status,
      priority: filters.priority,
      isUrgent: filters.isUrgent,
      overdue: filters.overdue,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    };
  }
}
