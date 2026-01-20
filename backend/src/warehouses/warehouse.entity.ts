import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@Entity("warehouse")
export class Warehouse {
  @ApiProperty({ description: "Unique identifier (UUID)" })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({ description: "Warehouse name" })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @ApiPropertyOptional({ description: "Warehouse code" })
  @Column({ type: "varchar", length: 50, nullable: true })
  code?: string;

  @ApiPropertyOptional({ description: "Street address" })
  @Column({ type: "varchar", length: 255, nullable: true })
  address?: string;

  @ApiPropertyOptional({ description: "City" })
  @Column({ type: "varchar", length: 100, nullable: true })
  city?: string;

  @ApiPropertyOptional({ description: "State or province" })
  @Column({ type: "varchar", length: 100, nullable: true })
  state?: string;

  @ApiPropertyOptional({ description: "Postal code" })
  @Column({ type: "varchar", length: 20, nullable: true })
  postal_code?: string;

  @ApiPropertyOptional({ description: "Country" })
  @Column({ type: "varchar", length: 100, nullable: true })
  country?: string;

  @ApiPropertyOptional({ description: "Contact phone number" })
  @Column({ type: "varchar", length: 50, nullable: true })
  phone?: string;

  @ApiPropertyOptional({ description: "Contact email" })
  @Column({ type: "varchar", length: 255, nullable: true })
  email?: string;

  @ApiProperty({
    description: "Whether the warehouse is active",
    default: true,
  })
  @Column({ type: "boolean", default: true })
  is_active: boolean;

  @ApiProperty({ description: "Created at timestamp" })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: "Updated at timestamp" })
  @UpdateDateColumn()
  updated_at: Date;

  @ApiPropertyOptional({ description: "Deleted at timestamp (soft delete)" })
  @DeleteDateColumn()
  deleted_at?: Date;
}
