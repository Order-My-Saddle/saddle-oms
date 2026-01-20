import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CountryManagerEntity } from "../entities/country-manager.entity";

/**
 * Country Manager Repository
 *
 * Handles database operations for country managers
 */
@Injectable()
export class CountryManagerRepository {
  constructor(
    @InjectRepository(CountryManagerEntity)
    private readonly repository: Repository<CountryManagerEntity>,
  ) {}

  /**
   * Create a new country manager
   */
  async create(
    countryManagerData: Partial<CountryManagerEntity>,
  ): Promise<CountryManagerEntity> {
    const countryManager = this.repository.create(countryManagerData);
    return await this.repository.save(countryManager);
  }

  /**
   * Find country manager by ID
   */
  async findById(id: number): Promise<CountryManagerEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  /**
   * Find country manager by user ID
   */
  async findByUserId(userId: number): Promise<CountryManagerEntity | null> {
    return await this.repository.findOne({
      where: { userId },
      relations: ["user"],
    });
  }


  /**
   * Find all country managers with optional filters
   */
  async findAll(filters?: {
    country?: string;
    region?: string;
    isActive?: boolean;
    isFromProduction?: boolean;
  }): Promise<CountryManagerEntity[]> {
    const queryBuilder = this.repository
      .createQueryBuilder("cm")
      .leftJoinAndSelect("cm.user", "user");

    if (filters?.country) {
      queryBuilder.andWhere("cm.country = :country", {
        country: filters.country,
      });
    }

    if (filters?.region) {
      queryBuilder.andWhere("cm.region = :region", { region: filters.region });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere("cm.isActive = :isActive", {
        isActive: filters.isActive,
      });
    }


    return await queryBuilder.getMany();
  }

  /**
   * Find country managers by country
   */
  async findByCountry(country: string): Promise<CountryManagerEntity[]> {
    return await this.repository.find({
      where: { country },
      relations: ["user"],
    });
  }

  /**
   * Find country managers by region
   */
  async findByRegion(region: string): Promise<CountryManagerEntity[]> {
    return await this.repository.find({
      where: { region },
      relations: ["user"],
    });
  }

  /**
   * Find active country managers
   */
  async findActive(): Promise<CountryManagerEntity[]> {
    return await this.repository.find({
      where: { isActive: true },
      relations: ["user"],
    });
  }


  /**
   * Update country manager
   */
  async update(
    id: number,
    updateData: Partial<CountryManagerEntity>,
  ): Promise<CountryManagerEntity | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  /**
   * Soft delete country manager
   */
  async softDelete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  /**
   * Count all country managers
   */
  async count(): Promise<number> {
    return await this.repository.count();
  }

  /**
   * Count active country managers
   */
  async countActive(): Promise<number> {
    return await this.repository.count({
      where: { isActive: true },
    });
  }

  /**
   * Count inactive country managers
   */
  async countInactive(): Promise<number> {
    return await this.repository.count({
      where: { isActive: false },
    });
  }

}
