import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SaddleEntity } from "./infrastructure/persistence/relational/entities/saddle.entity";
import { BrandEntity } from "../brands/infrastructure/persistence/relational/entities/brand.entity";
import { ModelEntity } from "../models/infrastructure/persistence/relational/entities/model.entity";

export interface CreateProductDto {
  brand: string;
  modelName: string;
  factoryEu?: number;
  factoryGb?: number;
  factoryUs?: number;
  factoryCa?: number;
  factoryAud?: number;
  factoryDe?: number;
  factoryNl?: number;
  presets?: string;
  active?: boolean;
  type?: number;
  sequence?: number;
}

export interface UpdateProductDto {
  brand?: string;
  modelName?: string;
  factoryEu?: number;
  factoryGb?: number;
  factoryUs?: number;
  factoryCa?: number;
  factoryAud?: number;
  factoryDe?: number;
  factoryNl?: number;
  presets?: string;
  active?: boolean;
  type?: number;
  sequence?: number;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(SaddleEntity)
    private readonly saddleRepository: Repository<SaddleEntity>,
    @InjectRepository(BrandEntity)
    private readonly brandRepository: Repository<BrandEntity>,
    @InjectRepository(ModelEntity)
    private readonly modelRepository: Repository<ModelEntity>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<SaddleEntity> {
    const saddle = this.saddleRepository.create({
      brand: createProductDto.brand,
      modelName: createProductDto.modelName,
      factoryEu: createProductDto.factoryEu || 0,
      factoryGb: createProductDto.factoryGb || 0,
      factoryUs: createProductDto.factoryUs || 0,
      factoryCa: createProductDto.factoryCa || 0,
      factoryAud: createProductDto.factoryAud,
      factoryDe: createProductDto.factoryDe,
      factoryNl: createProductDto.factoryNl,
      presets: createProductDto.presets,
      active: createProductDto.active ?? true,
      type: createProductDto.type || 0,
      sequence: createProductDto.sequence || 0,
    });

    return this.saddleRepository.save(saddle);
  }

  async findAll(): Promise<SaddleEntity[]> {
    return this.saddleRepository.find({
      where: { deleted: false },
      order: { sequence: "ASC", brand: "ASC", modelName: "ASC" },
    });
  }

  async findOne(id: string | number): Promise<SaddleEntity> {
    const whereClause = SaddleEntity.createFindOptions(id);
    const saddle = await this.saddleRepository.findOne({
      where: { ...whereClause, deleted: false },
    });

    if (!saddle) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return saddle;
  }

  async update(
    id: string | number,
    updateProductDto: UpdateProductDto,
  ): Promise<SaddleEntity> {
    const saddle = await this.findOne(id);

    Object.assign(saddle, updateProductDto);
    return this.saddleRepository.save(saddle);
  }

  async remove(id: string | number): Promise<void> {
    const saddle = await this.findOne(id);
    saddle.deleted = true;
    saddle.deletedAt = new Date();
    await this.saddleRepository.save(saddle);
  }

  async findByBrand(brandName: string): Promise<SaddleEntity[]> {
    return this.saddleRepository.find({
      where: {
        brand: brandName,
        deleted: false,
        active: true,
      },
      order: { sequence: "ASC", modelName: "ASC" },
    });
  }

  async findByFactoryRegion(region: string): Promise<SaddleEntity[]> {
    const queryBuilder = this.saddleRepository
      .createQueryBuilder("saddle")
      .where("saddle.deleted = false")
      .andWhere("saddle.active = true");

    switch (region.toLowerCase()) {
      case "eu":
        queryBuilder.andWhere("saddle.factory_eu > 0");
        break;
      case "gb":
        queryBuilder.andWhere("saddle.factory_gb > 0");
        break;
      case "us":
        queryBuilder.andWhere("saddle.factory_us > 0");
        break;
      case "ca":
        queryBuilder.andWhere("saddle.factory_ca > 0");
        break;
      case "aud":
        queryBuilder.andWhere("saddle.factory_aud > 0");
        break;
      case "de":
        queryBuilder.andWhere("saddle.factory_de > 0");
        break;
      case "nl":
        queryBuilder.andWhere("saddle.factory_nl > 0");
        break;
      default:
        throw new NotFoundException(`Region ${region} not supported`);
    }

    return queryBuilder
      .orderBy("saddle.sequence", "ASC")
      .addOrderBy("saddle.brand", "ASC")
      .addOrderBy("saddle.model_name", "ASC")
      .getMany();
  }

  async findAvailableProducts(): Promise<SaddleEntity[]> {
    return this.saddleRepository.find({
      where: {
        deleted: false,
        active: true,
      },
      order: { sequence: "ASC", brand: "ASC", modelName: "ASC" },
    });
  }
}
