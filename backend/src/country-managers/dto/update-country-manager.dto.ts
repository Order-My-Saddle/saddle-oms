import { PartialType } from "@nestjs/swagger";
import { CreateCountryManagerDto } from "./create-country-manager.dto";

export class UpdateCountryManagerDto extends PartialType(
  CreateCountryManagerDto,
) {}
