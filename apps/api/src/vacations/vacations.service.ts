import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class VacationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    console.log("VacationsService.findAll check:", typeof this.prisma);
    return [];
  }

  async findOne(id: string) {
    console.log("VacationsService.findOne check:", typeof this.prisma, typeof id);
    return null;
  }

  async create(dto: any) {
    console.log("VacationsService.create check:", typeof this.prisma, typeof dto);
    return { success: true };
  }

  async update(id: string, dto: any) {
    console.log("VacationsService.update check:", typeof this.prisma, typeof id, typeof dto);
    return { success: true };
  }

  async remove(id: string) {
    console.log("VacationsService.remove check:", typeof this.prisma, typeof id);
    return { success: true };
  }
}
