import { Brand } from "./brand";

/**
 * Brand Domain Repository Interface
 *
 * Defines the contract for brand persistence without exposing infrastructure details
 */
export abstract class IBrandRepository {
  abstract findById(id: number): Promise<Brand | null>;
  abstract findByName(name: string): Promise<Brand | null>;
  abstract findByStatus(): Promise<Brand[]>;
  abstract save(brand: Brand): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract findAll(filters?: { name?: string }): Promise<Brand[]>;
  abstract existsByName(name: string): Promise<boolean>;
  abstract findActiveBrands(): Promise<Brand[]>;
  abstract countByStatus(): Promise<number>;
}
