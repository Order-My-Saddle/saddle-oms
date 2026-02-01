import { PartialType } from "@nestjs/swagger";
import { CreateSaddleExtraDto } from "./create-saddle-extra.dto";

export class UpdateSaddleExtraDto extends PartialType(CreateSaddleExtraDto) {}
