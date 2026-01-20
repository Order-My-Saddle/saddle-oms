import { PartialType } from "@nestjs/swagger";
import { CreateOptionItemDto } from "./create-option-item.dto";

export class UpdateOptionItemDto extends PartialType(CreateOptionItemDto) {}
