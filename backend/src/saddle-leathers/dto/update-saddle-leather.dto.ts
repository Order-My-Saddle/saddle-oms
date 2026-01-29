import { PartialType } from "@nestjs/swagger";
import { CreateSaddleLeatherDto } from "./create-saddle-leather.dto";

export class UpdateSaddleLeatherDto extends PartialType(
  CreateSaddleLeatherDto,
) {}
