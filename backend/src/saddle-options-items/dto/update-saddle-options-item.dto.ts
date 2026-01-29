import { PartialType } from "@nestjs/swagger";
import { CreateSaddleOptionsItemDto } from "./create-saddle-options-item.dto";

export class UpdateSaddleOptionsItemDto extends PartialType(
  CreateSaddleOptionsItemDto,
) {}
