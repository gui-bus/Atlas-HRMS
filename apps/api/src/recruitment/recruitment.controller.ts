import { Controller, Get, Post, Body } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RecruitmentService } from "./recruitment.service";

@ApiTags("recruitment")
@Controller("recruitment")
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get()
  async findAll() {
    return this.recruitmentService.findAll();
  }

  @Post()
  async create(@Body() dto: any) {
    return this.recruitmentService.create(dto);
  }
}
