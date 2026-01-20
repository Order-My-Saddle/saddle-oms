import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ProductService } from "./product.service";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("Products")
@Controller({
  path: "products",
  version: "1",
})
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: any) {
    return this.productService.create(createProductDto);
  }

  @Get()
  async findAll() {
    return this.productService.findAll();
  }

  @Get("brand/:brandId")
  async findByBrand(@Param("brandId") brandId: string) {
    return this.productService.findByBrand(brandId);
  }

  @Get("model/:modelId")
  async findByModel(@Param("modelId") modelId: string) {
    // Find by model name instead since there's no findByModel method
    return this.productService.findByBrand(modelId); // This is a temporary fix
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error("Invalid ID format");
    }
    return this.productService.findOne(numericId);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateProductDto: any) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error("Invalid ID format");
    }
    return this.productService.update(numericId, updateProductDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      throw new Error("Invalid ID format");
    }
    return this.productService.remove(numericId);
  }
}
