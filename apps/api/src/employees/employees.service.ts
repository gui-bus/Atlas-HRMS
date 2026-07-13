import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    console.log("EmployeesService.findAll check:", typeof this.prisma);
    return [];
  }

  async findOne(id: string) {
    console.log("EmployeesService.findOne check:", typeof this.prisma, typeof id);
    return null;
  }

  async create(dto: any) {
    console.log("EmployeesService.create check:", typeof this.prisma, typeof dto);
    return { success: true };
  }

  async update(id: string, dto: any) {
    console.log("EmployeesService.update check:", typeof this.prisma, typeof id, typeof dto);
    return { success: true };
  }

  async remove(id: string) {
    console.log("EmployeesService.remove check:", typeof this.prisma, typeof id);
    return { success: true };
  }
}
