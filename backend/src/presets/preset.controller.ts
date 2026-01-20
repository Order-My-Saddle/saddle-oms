import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { PresetService } from "./preset.service";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("Presets")
@Controller({
  path: "presets",
  version: "1",
})
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
export class PresetController {
  constructor(private readonly presetService: PresetService) {}

  @Post()
  async create(@Body() createPresetDto: any) {
    return this.presetService.create(createPresetDto);
  }

  @Get()
  async findAll() {
    return this.presetService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.presetService.findOne(id);
  }

  @Patch(":id")
  async update(@Param("id", ParseIntPipe) id: number, @Body() updatePresetDto: any) {
    return this.presetService.update(id, updatePresetDto);
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.presetService.remove(id);
  }
}
