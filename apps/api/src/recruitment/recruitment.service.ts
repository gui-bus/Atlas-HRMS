import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class RecruitmentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    console.log("RecruitmentService.findAll check:", typeof this.prisma);
    return [];
  }

  async create(dto: any) {
    console.log("RecruitmentService.create check:", typeof this.prisma, typeof dto);
    return { success: true };
  }
}
