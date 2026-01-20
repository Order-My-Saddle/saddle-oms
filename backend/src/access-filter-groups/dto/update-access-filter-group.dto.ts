import { PartialType } from "@nestjs/swagger";
import { CreateAccessFilterGroupDto } from "./create-access-filter-group.dto";

export class UpdateAccessFilterGroupDto extends PartialType(
  CreateAccessFilterGroupDto,
) {}
