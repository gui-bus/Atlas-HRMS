import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    console.log("PositionsService.findAll check:", typeof this.prisma);
    return [];
  }

  async findOne(id: string) {
    console.log("PositionsService.findOne check:", typeof this.prisma, typeof id);
    return null;
  }

  async create(dto: any) {
    console.log("PositionsService.create check:", typeof this.prisma, typeof dto);
    return { success: true };
  }

  async update(id: string, dto: any) {
    console.log("PositionsService.update check:", typeof this.prisma, typeof id, typeof dto);
    return { success: true };
  }

  async remove(id: string) {
    console.log("PositionsService.remove check:", typeof this.prisma, typeof id);
    return { success: true };
  }
}
