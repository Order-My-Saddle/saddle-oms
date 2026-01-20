import { PartialType } from "@nestjs/swagger";
import { CreateSaddleDto } from "./create-saddle.dto";

export class UpdateSaddleDto extends PartialType(CreateSaddleDto) {}
