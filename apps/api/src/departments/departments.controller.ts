import { Controller, Get, Post, Put, Delete, Body, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DepartmentsService } from "./departments.service";

@ApiTags("departments")
@Controller("departments")
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async findAll() {
    return this.departmentsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.departmentsService.create(dto);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: any) {
    return this.departmentsService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.departmentsService.remove(id);
  }
}
