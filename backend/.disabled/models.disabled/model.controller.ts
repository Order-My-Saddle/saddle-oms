import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { ModelService } from "./model.service";
import { CreateModelDto } from "./dto/create-model.dto";
import { UpdateModelDto } from "./dto/update-model.dto";
import { QueryModelDto } from "./dto/query-model.dto";
import { ModelDto } from "./dto/model.dto";
import { ModelStatus } from "./domain/value-objects/model-status.value-object";
import { AuthGuard } from "@nestjs/passport";

/**
 * Model REST API Controller
 *
 * Handles HTTP requests for model management operations
 */
@ApiTags("Models")
@Controller({
  path: "models",
  version: "1",
})
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new model",
    description: "Creates a new model with the provided information",
  })
  @ApiResponse({
    status: 201,
    description: "Model created successfully",
    type: ModelDto,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input data or brand not found/inactive",
  })
  @ApiResponse({
    status: 409,
    description: "Model with this name already exists for this brand",
  })
  async create(@Body() createModelDto: CreateModelDto): Promise<ModelDto> {
    return this.modelService.create(createModelDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all models",
    description: "Retrieve all models with optional filtering and pagination",
  })
  @ApiResponse({
    status: 200,
    description: "Models retrieved successfully",
    type: [ModelDto],
  })
  @ApiQuery({
    name: "query",
    type: QueryModelDto,
    required: false,
    description: "Query parameters for filtering and pagination",
  })
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @Query("brandId") brandId?: number,
  ): Promise<{ data: ModelDto[]; total: number; pages: number }> {
    return this.modelService.findAll(page, limit, search, brandId);
  }

  @Get("active")
  @ApiOperation({
    summary: "Get active models only",
    description: "Retrieve all models with active status",
  })
  @ApiResponse({
    status: 200,
    description: "Active models retrieved successfully",
    type: [ModelDto],
  })
  async findActiveModels(): Promise<ModelDto[]> {
    return this.modelService.findActiveModels();
  }

  @Get("brand/:brandId")
  @ApiOperation({
    summary: "Get models by brand",
    description: "Retrieve all models for a specific brand",
  })
  @ApiParam({
    name: "brandId",
    description: "Brand UUID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Models retrieved successfully",
    type: [ModelDto],
  })
  async findByBrand(
    @Param("brandId", ParseUUIDPipe) brandId: string,
  ): Promise<ModelDto[]> {
    return this.modelService.findByBrand(brandId);
  }

  @Get("brand/:brandId/active")
  @ApiOperation({
    summary: "Get active models by brand",
    description: "Retrieve all active models for a specific brand",
  })
  @ApiParam({
    name: "brandId",
    description: "Brand UUID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Active models retrieved successfully",
    type: [ModelDto],
  })
  async findActiveModelsByBrand(
    @Param("brandId", ParseUUIDPipe) brandId: string,
  ): Promise<ModelDto[]> {
    return this.modelService.findActiveModelsByBrand(brandId);
  }

  @Get("status/:status")
  @ApiOperation({
    summary: "Get models by status",
    description: "Retrieve all models with a specific status",
  })
  @ApiParam({
    name: "status",
    description: "Model status",
    enum: ModelStatus,
    example: ModelStatus.ACTIVE,
  })
  @ApiResponse({
    status: 200,
    description: "Models retrieved successfully",
    type: [ModelDto],
  })
  async findByStatus(
    @Param("status") status: ModelStatus,
  ): Promise<ModelDto[]> {
    return this.modelService.findByStatus(status);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get model by ID",
    description: "Retrieve a specific model by its unique identifier",
  })
  @ApiParam({
    name: "id",
    description: "Model UUID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @ApiResponse({
    status: 200,
    description: "Model found",
    type: ModelDto,
  })
  @ApiResponse({
    status: 404,
    description: "Model not found",
  })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<ModelDto> {
    return this.modelService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update model",
    description: "Update model information",
  })
  @ApiParam({
    name: "id",
    description: "Model UUID",
  })
  @ApiResponse({
    status: 200,
    description: "Model updated successfully",
    type: ModelDto,
  })
  @ApiResponse({
    status: 404,
    description: "Model not found",
  })
  @ApiResponse({
    status: 409,
    description: "Name conflict with existing model",
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateModelDto: UpdateModelDto,
  ): Promise<ModelDto> {
    return this.modelService.update(id, updateModelDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Delete model",
    description: "Soft delete a model (sets deletedAt timestamp)",
  })
  @ApiParam({
    name: "id",
    description: "Model UUID",
  })
  @ApiResponse({
    status: 204,
    description: "Model deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Model not found",
  })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.modelService.remove(id);
  }
}
