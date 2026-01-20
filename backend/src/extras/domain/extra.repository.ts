import { Extra } from "./extra";
import { ExtraId } from "./value-objects/extra-id.value-object";
import { ExtraStatus } from "./value-objects/extra-status.value-object";

export interface ExtraRepository {
  save(extra: Extra): Promise<Extra>;
  findById(id: ExtraId): Promise<Extra | null>;
  findByName(name: string): Promise<Extra | null>;
  findAll(): Promise<Extra[]>;
  findByStatus(status: ExtraStatus): Promise<Extra[]>;
  findActiveExtras(): Promise<Extra[]>;
  delete(id: ExtraId): Promise<void>;
}
