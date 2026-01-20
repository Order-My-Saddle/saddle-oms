import { Warehouse } from "./warehouse";
import { WarehouseId } from "./value-objects/warehouse-id.value-object";

/**
 * Warehouse Repository Interface
 *
 * Defines the contract for warehouse data access operations.
 * This interface abstracts the persistence layer following hexagonal architecture.
 */
export interface IWarehouseRepository {
  /**
   * Save a warehouse entity
   */
  save(warehouse: Warehouse): Promise<void>;

  /**
   * Find warehouse by ID
   */
  findById(id: WarehouseId): Promise<Warehouse | null>;

  /**
   * Find warehouse by code
   */
  findByCode(code: string): Promise<Warehouse | null>;

  /**
   * Find all warehouses with optional filters
   */
  findAll(filters?: {
    name?: string;
    code?: string;
    city?: string;
    country?: string;
    isActive?: boolean;
  }): Promise<Warehouse[]>;

  /**
   * Find active warehouses
   */
  findActive(): Promise<Warehouse[]>;

  /**
   * Find warehouses by country
   */
  findByCountry(country: string): Promise<Warehouse[]>;

  /**
   * Find warehouses by city
   */
  findByCity(city: string): Promise<Warehouse[]>;

  /**
   * Count warehouses by country
   */
  countByCountry(country: string): Promise<number>;

  /**
   * Count active warehouses
   */
  countActive(): Promise<number>;

  /**
   * Delete warehouse (soft delete)
   */
  delete(id: WarehouseId): Promise<void>;

  /**
   * Check if warehouse exists by code
   */
  existsByCode(code: string): Promise<boolean>;

  /**
   * Check if warehouse exists by name
   */
  existsByName(name: string): Promise<boolean>;
}
