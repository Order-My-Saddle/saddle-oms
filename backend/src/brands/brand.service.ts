import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { BrandEntity } from "./infrastructure/persistence/relational/entities/brand.entity";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { BrandDto } from "./dto/brand.dto";
import { plainToClass } from "class-transformer";

/**
 * Simplified Brand Service using direct TypeORM operations
 */
@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepository: Repository<BrandEntity>,
  ) {}

  /**
   * Create a new brand
   */
  async create(createBrandDto: CreateBrandDto): Promise<BrandDto> {
    // Check if brand with this name already exists
    const existingBrand = await this.brandRepository.findOne({
      where: { name: createBrandDto.name },
    });

    if (existingBrand) {
      throw new ConflictException("Brand with this name already exists");
    }

    const brand = this.brandRepository.create(createBrandDto);
    const savedBrand = await this.brandRepository.save(brand);

    return this.toDto(savedBrand);
  }

  /**
   * Find brand by ID
   */
  async findOne(id: number): Promise<BrandDto> {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    return this.toDto(brand);
  }

  /**
   * Find all brands with filtering and pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: BrandDto[]; total: number; pages: number }> {
    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const [brands, total] = await this.brandRepository.findAndCount({
      where,
      order: { name: "ASC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: brands.map((brand) => this.toDto(brand)),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update brand
   */
  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<BrandDto> {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    // Check for name conflicts if name is being changed
    if (updateBrandDto.name && updateBrandDto.name !== brand.name) {
      const existingBrand = await this.brandRepository.findOne({
        where: { name: updateBrandDto.name },
      });
      if (existingBrand && existingBrand.id !== brand.id) {
        throw new ConflictException("Brand with this name already exists");
      }
    }

    Object.assign(brand, updateBrandDto);
    const savedBrand = await this.brandRepository.save(brand);

    return this.toDto(savedBrand);
  }

  /**
   * Remove brand (hard delete — brands table has no soft-delete column)
   */
  async remove(id: number): Promise<void> {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException("Brand not found");
    }

    await this.brandRepository.delete(id);
  }

  /**
   * Get active brands only
   */
  async findActiveBrands(): Promise<BrandDto[]> {
    const brands = await this.brandRepository.find({
      order: { name: "ASC" },
    });

    return brands.map((brand) => this.toDto(brand));
  }

  /**
   * Convert entity to DTO
   */
  private toDto(brand: BrandEntity): BrandDto {
    const dto = plainToClass(BrandDto, brand, {
      excludeExtraneousValues: true,
    });
    dto.isActive = true;
    dto.displayName = brand.name;
    return dto;
  }
}
