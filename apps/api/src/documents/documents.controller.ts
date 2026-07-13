import { Controller, Get, Post, Delete, Body, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DocumentsService } from "./documents.service";

@ApiTags("documents")
@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async findAll() {
    return this.documentsService.findAll();
  }

  @Post()
  async create(@Body() dto: any) {
    return this.documentsService.create(dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.documentsService.remove(id);
  }
}
