import { PartialType } from "@nestjs/swagger";
import { CreateModelDto } from "./create-model.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { ModelStatus } from "../domain/value-objects/model-status.value-object";

export class UpdateModelDto extends PartialType(CreateModelDto) {
  @ApiPropertyOptional({
    description: "Model status",
    enum: ModelStatus,
    example: ModelStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ModelStatus)
  status?: ModelStatus;
}
