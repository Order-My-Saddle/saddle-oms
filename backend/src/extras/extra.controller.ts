import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ExtraService } from "./extra.service";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("Extras")
@Controller({
  path: "extras",
  version: "1",
})
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
export class ExtraController {
  constructor(private readonly extraService: ExtraService) {}

  @Post()
  async create(@Body() createExtraDto: any) {
    return this.extraService.create(createExtraDto);
  }

  @Get()
  async findAll() {
    return this.extraService.findAll();
  }

  @Get("active")
  async findActiveExtras() {
    return this.extraService.findActiveExtras();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.extraService.findOne(id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateExtraDto: any) {
    return this.extraService.update(id, updateExtraDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.extraService.remove(id);
  }
}
