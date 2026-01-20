import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  EnrichedOrdersService,
  EnrichedOrdersQueryDto,
} from "./enriched-orders.service";

@ApiTags("Enriched Orders")
@Controller({
  path: "enriched_orders",
  version: "1",
})
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
export class EnrichedOrdersController {
  private readonly logger = new Logger(EnrichedOrdersController.name);

  constructor(private readonly enrichedOrdersService: EnrichedOrdersService) {}

  @Get()
  async getEnrichedOrders(@Query() query: EnrichedOrdersQueryDto) {
    try {
      this.logger.log(
        `Fetching enriched orders with query: ${JSON.stringify(query)}`,
      );

      // Validate and sanitize query parameters
      const sanitizedQuery = this.sanitizeQuery(query);

      const result =
        await this.enrichedOrdersService.getEnrichedOrders(sanitizedQuery);

      this.logger.log(
        `Successfully returned ${result.data.length} enriched orders`,
      );

      return {
        "@context": "/api/contexts/EnrichedOrder",
        "@type": "hydra:Collection",
        "@id": "/api/enriched_orders",
        "hydra:member": result.data,
        "hydra:totalItems": result.pagination.totalItems,
        "hydra:view": {
          "@id": `/api/enriched_orders?page=${result.pagination.currentPage}`,
          "@type": "hydra:PartialCollectionView",
          "hydra:first": "/api/enriched_orders?page=1",
          "hydra:last": `/api/enriched_orders?page=${result.pagination.totalPages}`,
          ...(result.pagination.hasNext && {
            "hydra:next": `/api/enriched_orders?page=${result.pagination.currentPage + 1}`,
          }),
          ...(result.pagination.hasPrevious && {
            "hydra:previous": `/api/enriched_orders?page=${result.pagination.currentPage - 1}`,
          }),
        },
        metadata: result.metadata,
      };
    } catch (error) {
      this.logger.error("Failed to fetch enriched orders", error);
      throw new HttpException(
        {
          message: "Failed to fetch enriched orders",
          details: error.message,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("health")
  async getHealth() {
    await Promise.resolve();
    return {
      status: "healthy",
      service: "enriched-orders",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };
  }

  private sanitizeQuery(query: EnrichedOrdersQueryDto): EnrichedOrdersQueryDto {
    return {
      page: this.parsePositiveInt(query.page, 1),
      limit: Math.min(this.parsePositiveInt(query.limit, 50) || 50, 100), // Max 100 per page
      partial: query.partial === "true" || query.partial === true,
      searchTerm: query.searchTerm
        ? String(query.searchTerm).trim()
        : undefined,
      orderBy: this.sanitizeOrderBy(query.orderBy),
      orderDirection: query.orderDirection === "ASC" ? "ASC" : "DESC",
      urgency: query.urgency ? String(query.urgency).trim() : undefined,
      fitterId: this.parsePositiveInt(query.fitterId),
      customerId: this.parsePositiveInt(query.customerId),
      brandId: this.parsePositiveInt(query.brandId),
      orderStatus: query.orderStatus
        ? String(query.orderStatus).trim()
        : undefined,
    };
  }

  private parsePositiveInt(
    value: any,
    defaultValue?: number,
  ): number | undefined {
    if (value === undefined || value === null) return defaultValue;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) || parsed <= 0 ? defaultValue : parsed;
  }

  private sanitizeOrderBy(orderBy?: string): string | undefined {
    if (!orderBy) return undefined;

    const allowedColumns = [
      "created_at",
      "urgency",
      "customer_name",
      "fitter_name",
      "brand_name",
      "model_name",
      "seat_size",
      "status",
    ];

    return allowedColumns.includes(orderBy) ? orderBy : undefined;
  }
}
