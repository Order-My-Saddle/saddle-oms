import { Entity, Index, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { PresetEntity } from "./preset.entity";

@Entity("presets_items")
@Index("preset_items_preset_index", ["presetId"])
@Index("preset_items_options_index", ["optionsId"])
export class PresetItemEntity {
  @PrimaryColumn({ name: "options_id", type: "integer" })
  optionsId: number;

  @PrimaryColumn({ name: "item_id", type: "integer" })
  itemId: number;

  @PrimaryColumn({ name: "preset_id", type: "integer" })
  presetId: number;

  // Relations
  @ManyToOne(() => PresetEntity, { lazy: true })
  @JoinColumn({ name: "preset_id" })
  preset?: PresetEntity;
}
