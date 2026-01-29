import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FitterEntity } from "./infrastructure/persistence/relational/entities/fitter.entity";
import { CreateFitterDto } from "./dto/create-fitter.dto";
import { UpdateFitterDto } from "./dto/update-fitter.dto";
import { FitterDto } from "./dto/fitter.dto";

/**
 * Fitter Application Service
 *
 * Manages fitter operations with simplified schema.
 * Uses integer IDs to match PostgreSQL schema.
 */
@Injectable()
export class FitterService {
  constructor(
    @InjectRepository(FitterEntity)
    private readonly fitterRepository: Repository<FitterEntity>,
  ) {}

  /**
   * Create a new fitter
   */
  async create(createFitterDto: CreateFitterDto): Promise<FitterDto> {
    const fitter = this.fitterRepository.create({
      userId: createFitterDto.userId ?? null,
      address: createFitterDto.address ?? null,
      zipcode: createFitterDto.zipcode ?? null,
      state: createFitterDto.state ?? null,
      city: createFitterDto.city ?? null,
      country: createFitterDto.country ?? null,
      phoneNo: createFitterDto.phoneNo ?? null,
      cellNo: createFitterDto.cellNo ?? null,
      currency: createFitterDto.currency ?? null,
      emailaddress: createFitterDto.emailaddress ?? null,
      deleted: 0,
    });

    const savedFitter = await this.fitterRepository.save(fitter);
    return this.toDto(savedFitter);
  }

  /**
   * Find fitter by ID
   */
  async findOne(id: number): Promise<FitterDto> {
    const fitter = await this.fitterRepository.findOne({
      where: { id, deleted: 0 },
    });

    if (!fitter) {
      throw new NotFoundException("Fitter not found");
    }

    return this.toDto(fitter);
  }

  /**
   * Find all fitters with filtering and pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    city?: string,
    country?: string,
  ): Promise<{ data: FitterDto[]; total: number; pages: number }> {
    const queryBuilder = this.fitterRepository
      .createQueryBuilder("fitter")
      .where("fitter.deleted = 0");

    if (city) {
      queryBuilder.andWhere("fitter.city ILIKE :city", { city: `%${city}%` });
    }

    if (country) {
      queryBuilder.andWhere("fitter.country ILIKE :country", {
        country: `%${country}%`,
      });
    }

    queryBuilder.orderBy("fitter.city", "ASC");

    const total = await queryBuilder.getCount();
    const fitters = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: fitters.map((fitter) => this.toDto(fitter)),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update fitter
   */
  async update(
    id: number,
    updateFitterDto: UpdateFitterDto,
  ): Promise<FitterDto> {
    const fitter = await this.fitterRepository.findOne({
      where: { id, deleted: 0 },
    });

    if (!fitter) {
      throw new NotFoundException("Fitter not found");
    }

    // Update fields that are provided
    if (updateFitterDto.userId !== undefined)
      fitter.userId = updateFitterDto.userId;
    if (updateFitterDto.address !== undefined)
      fitter.address = updateFitterDto.address;
    if (updateFitterDto.zipcode !== undefined)
      fitter.zipcode = updateFitterDto.zipcode;
    if (updateFitterDto.state !== undefined)
      fitter.state = updateFitterDto.state;
    if (updateFitterDto.city !== undefined) fitter.city = updateFitterDto.city;
    if (updateFitterDto.country !== undefined)
      fitter.country = updateFitterDto.country;
    if (updateFitterDto.phoneNo !== undefined)
      fitter.phoneNo = updateFitterDto.phoneNo;
    if (updateFitterDto.cellNo !== undefined)
      fitter.cellNo = updateFitterDto.cellNo;
    if (updateFitterDto.currency !== undefined)
      fitter.currency = updateFitterDto.currency;
    if (updateFitterDto.emailaddress !== undefined)
      fitter.emailaddress = updateFitterDto.emailaddress;

    const savedFitter = await this.fitterRepository.save(fitter);
    return this.toDto(savedFitter);
  }

  /**
   * Remove fitter (soft delete)
   */
  async remove(id: number): Promise<void> {
    const fitter = await this.fitterRepository.findOne({
      where: { id, deleted: 0 },
    });

    if (!fitter) {
      throw new NotFoundException("Fitter not found");
    }

    fitter.deleted = 1;
    await this.fitterRepository.save(fitter);
  }

  /**
   * Find fitter by user ID
   */
  async findByUserId(userId: number): Promise<FitterDto | null> {
    const fitter = await this.fitterRepository.findOne({
      where: { userId, deleted: 0 },
    });
    return fitter ? this.toDto(fitter) : null;
  }

  /**
   * Find active fitters
   */
  async findActiveFitters(): Promise<FitterDto[]> {
    const fitters = await this.fitterRepository.find({
      where: { deleted: 0 },
      order: { city: "ASC" },
    });
    return fitters.map((fitter) => this.toDto(fitter));
  }

  /**
   * Find fitters by country
   */
  async findByCountry(country: string): Promise<FitterDto[]> {
    const fitters = await this.fitterRepository
      .createQueryBuilder("fitter")
      .where("fitter.deleted = 0")
      .andWhere("fitter.country ILIKE :country", { country: `%${country}%` })
      .orderBy("fitter.city", "ASC")
      .getMany();
    return fitters.map((fitter) => this.toDto(fitter));
  }

  /**
   * Find fitters by city
   */
  async findByCity(city: string): Promise<FitterDto[]> {
    const fitters = await this.fitterRepository
      .createQueryBuilder("fitter")
      .where("fitter.deleted = 0")
      .andWhere("fitter.city ILIKE :city", { city: `%${city}%` })
      .getMany();
    return fitters.map((fitter) => this.toDto(fitter));
  }

  /**
   * Get fitter count by country
   */
  async getCountByCountry(country: string): Promise<number> {
    return this.fitterRepository
      .createQueryBuilder("fitter")
      .where("fitter.deleted = 0")
      .andWhere("fitter.country ILIKE :country", { country: `%${country}%` })
      .getCount();
  }

  /**
   * Get active fitter count
   */
  async getActiveCount(): Promise<number> {
    return this.fitterRepository.count({
      where: { deleted: 0 },
    });
  }

  /**
   * Convert entity to DTO
   */
  private toDto(fitter: FitterEntity): FitterDto {
    const dto = new FitterDto();
    dto.id = fitter.id;
    dto.userId = fitter.userId ?? undefined;
    dto.address = fitter.address ?? undefined;
    dto.zipcode = fitter.zipcode ?? undefined;
    dto.state = fitter.state ?? undefined;
    dto.city = fitter.city ?? undefined;
    dto.country = fitter.country ?? undefined;
    dto.phoneNo = fitter.phoneNo ?? undefined;
    dto.cellNo = fitter.cellNo ?? undefined;
    dto.currency = fitter.currency ?? undefined;
    dto.emailaddress = fitter.emailaddress ?? undefined;
    dto.deleted = fitter.deleted;
    dto.isActive = fitter.deleted === 0;
    dto.fullAddress = fitter.fullAddress;
    dto.displayName = fitter.displayName;
    return dto;
  }
}
