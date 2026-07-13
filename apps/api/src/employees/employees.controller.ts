import { Controller, Get, Post, Put, Delete, Body, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { EmployeesService } from "./employees.service";

@ApiTags("employees")
@Controller("employees")
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.employeesService.findOne(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.employeesService.create(dto);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: any) {
    return this.employeesService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.employeesService.remove(id);
  }
}
