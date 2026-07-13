import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    console.log("DepartmentsService.findAll check:", typeof this.prisma);
    return [];
  }

  async findOne(id: string) {
    console.log("DepartmentsService.findOne check:", typeof this.prisma, typeof id);
    return null;
  }

  async create(dto: any) {
    console.log("DepartmentsService.create check:", typeof this.prisma, typeof dto);
    return { success: true };
  }

  async update(id: string, dto: any) {
    console.log("DepartmentsService.update check:", typeof this.prisma, typeof id, typeof dto);
    return { success: true };
  }

  async remove(id: string) {
    console.log("DepartmentsService.remove check:", typeof this.prisma, typeof id);
    return { success: true };
  }
}
