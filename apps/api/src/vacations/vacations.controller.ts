import { Controller, Get, Post, Put, Delete, Body, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { VacationsService } from "./vacations.service";

@ApiTags("vacations")
@Controller("vacations")
export class VacationsController {
  constructor(private readonly vacationsService: VacationsService) {}

  @Get()
  async findAll() {
    return this.vacationsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.vacationsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.vacationsService.create(dto);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: any) {
    return this.vacationsService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.vacationsService.remove(id);
  }
}
