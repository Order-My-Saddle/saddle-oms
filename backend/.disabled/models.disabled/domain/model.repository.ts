import { Model } from "./model";
import { ModelId } from "./value-objects/model-id.value-object";
import { ModelStatus } from "./value-objects/model-status.value-object";
import { BrandId } from "../../brands/domain/value-objects/brand-id.value-object";

/**
 * Model Domain Repository Interface
 *
 * Defines the contract for model persistence without exposing infrastructure details
 */
export abstract class IModelRepository {
  abstract findById(id: ModelId): Promise<Model | null>;
  abstract findByName(name: string, brandId?: BrandId): Promise<Model | null>;
  abstract findByBrandId(brandId: BrandId): Promise<Model[]>;
  abstract findByStatus(status: ModelStatus): Promise<Model[]>;
  abstract save(model: Model): Promise<void>;
  abstract delete(id: ModelId): Promise<void>;
  abstract findAll(filters?: {
    status?: ModelStatus;
    brandId?: BrandId;
    name?: string;
    isCustomizable?: boolean;
  }): Promise<Model[]>;
  abstract existsByName(name: string, brandId?: BrandId): Promise<boolean>;
  abstract findActiveModels(): Promise<Model[]>;
  abstract findActiveModelsByBrand(brandId: BrandId): Promise<Model[]>;
  abstract countByStatus(status: ModelStatus): Promise<number>;
  abstract countByBrandId(brandId: BrandId): Promise<number>;
}
