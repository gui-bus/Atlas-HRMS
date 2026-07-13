import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    console.log("DocumentsService.findAll check:", typeof this.prisma);
    return [];
  }

  async create(dto: any) {
    console.log("DocumentsService.create check:", typeof this.prisma, typeof dto);
    return { success: true };
  }

  async remove(id: string) {
    console.log("DocumentsService.remove check:", typeof this.prisma, typeof id);
    return { success: true };
  }
}
