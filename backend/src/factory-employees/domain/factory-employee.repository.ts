import { FactoryEmployee } from "./factory-employee";
import { FactoryEmployeeId } from "./value-objects/factory-employee-id.value-object";

/**
 * Factory Employee Repository Interface
 * Defines the contract for factory employee data access
 */
export interface FactoryEmployeeRepository {
  /**
   * Find factory employee by ID
   */
  findById(id: FactoryEmployeeId): Promise<FactoryEmployee | null>;

  /**
   * Find factory employees by factory ID
   */
  findByFactoryId(factoryId: number): Promise<FactoryEmployee[]>;

  /**
   * Find all factory employees with optional filters
   */
  findAll(filters?: {
    factoryId?: number;
    name?: string;
    limit?: number;
    offset?: number;
  }): Promise<FactoryEmployee[]>;

  /**
   * Count factory employees
   */
  count(filters?: { factoryId?: number; name?: string }): Promise<number>;

  /**
   * Save factory employee
   */
  save(factoryEmployee: FactoryEmployee): Promise<FactoryEmployee>;

  /**
   * Update factory employee
   */
  update(
    id: FactoryEmployeeId,
    factoryEmployee: Partial<FactoryEmployee>,
  ): Promise<FactoryEmployee>;

  /**
   * Delete factory employee
   */
  delete(id: FactoryEmployeeId): Promise<void>;

  /**
   * Check if factory employee exists
   */
  exists(id: FactoryEmployeeId): Promise<boolean>;

  /**
   * Check if factory employee exists by name within a factory
   */
  existsByNameAndFactory(name: string, factoryId: number): Promise<boolean>;
}
