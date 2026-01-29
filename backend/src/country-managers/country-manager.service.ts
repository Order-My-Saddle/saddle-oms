import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CountryManagerRepository } from "./infrastructure/persistence/relational/repositories/country-manager.repository";
import { CreateCountryManagerDto } from "./dto/create-country-manager.dto";
import { UpdateCountryManagerDto } from "./dto/update-country-manager.dto";
import { QueryCountryManagerDto } from "./dto/query-country-manager.dto";
import { CountryManagerDto } from "./dto/country-manager.dto";

/**
 * Country Manager Application Service
 *
 * Orchestrates country manager domain operations
 */
@Injectable()
export class CountryManagerService {
  constructor(
    private readonly countryManagerRepository: CountryManagerRepository,
  ) {}

  /**
   * Create a new country manager
   */
  async create(
    createCountryManagerDto: CreateCountryManagerDto,
  ): Promise<CountryManagerDto> {
    // Check if country manager with this user ID already exists
    const existingCountryManager =
      await this.countryManagerRepository.findByUserId(
        createCountryManagerDto.userId,
      );

    if (existingCountryManager) {
      throw new ConflictException(
        "Country manager with this user ID already exists",
      );
    }

    const countryManager = await this.countryManagerRepository.create({
      userId: createCountryManagerDto.userId,
      country: createCountryManagerDto.country,
      region: createCountryManagerDto.region,
      isActive: createCountryManagerDto.isActive ?? true,
    });

    return this.mapToDto(countryManager);
  }

  /**
   * Find country manager by ID
   */
  async findOne(id: number): Promise<CountryManagerDto> {
    const countryManager = await this.countryManagerRepository.findById(id);

    if (!countryManager) {
      throw new NotFoundException("Country manager not found");
    }

    return this.mapToDto(countryManager);
  }

  /**
   * Find all country managers with filtering and pagination
   */
  async findAll(
    queryDto: QueryCountryManagerDto,
  ): Promise<CountryManagerDto[]> {
    const filters = queryDto.getCountryManagerFilters();

    const countryManagers = await this.countryManagerRepository.findAll({
      country: filters.country,
      region: filters.region,
      isActive: filters.isActive,
    });

    return countryManagers.map((cm) => this.mapToDto(cm));
  }

  /**
   * Update country manager
   */
  async update(
    id: number,
    updateCountryManagerDto: UpdateCountryManagerDto,
  ): Promise<CountryManagerDto> {
    const countryManager = await this.countryManagerRepository.findById(id);

    if (!countryManager) {
      throw new NotFoundException("Country manager not found");
    }

    const updated = await this.countryManagerRepository.update(
      id,
      updateCountryManagerDto,
    );

    if (!updated) {
      throw new NotFoundException("Country manager not found after update");
    }

    return this.mapToDto(updated);
  }

  /**
   * Remove country manager (soft delete)
   */
  async remove(id: number): Promise<void> {
    const countryManager = await this.countryManagerRepository.findById(id);

    if (!countryManager) {
      throw new NotFoundException("Country manager not found");
    }

    await this.countryManagerRepository.softDelete(id);
  }

  /**
   * Find country managers by country
   */
  async findByCountry(country: string): Promise<CountryManagerDto[]> {
    const countryManagers =
      await this.countryManagerRepository.findByCountry(country);
    return countryManagers.map((cm) => this.mapToDto(cm));
  }

  /**
   * Find country managers by region
   */
  async findByRegion(region: string): Promise<CountryManagerDto[]> {
    const countryManagers =
      await this.countryManagerRepository.findByRegion(region);
    return countryManagers.map((cm) => this.mapToDto(cm));
  }

  /**
   * Find active country managers
   */
  async findActive(): Promise<CountryManagerDto[]> {
    const countryManagers = await this.countryManagerRepository.findActive();
    return countryManagers.map((cm) => this.mapToDto(cm));
  }

  /**
   * Get country manager statistics
   */
  async getCountryManagerStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active, inactive] = await Promise.all([
      this.countryManagerRepository.count(),
      this.countryManagerRepository.countActive(),
      this.countryManagerRepository.countInactive(),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }

  /**
   * Map entity to DTO
   */
  private mapToDto(entity: any): CountryManagerDto {
    return {
      id: entity.id,
      userId: entity.userId,
      country: entity.country,
      region: entity.region,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }
}
