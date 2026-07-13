import { Controller, Get, Post, Put, Delete, Body, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PositionsService } from "./positions.service";

@ApiTags("positions")
@Controller("positions")
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  async findAll() {
    return this.positionsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.positionsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.positionsService.create(dto);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: any) {
    return this.positionsService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.positionsService.remove(id);
  }
}
