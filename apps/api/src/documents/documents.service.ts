import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.document.findMany({
      where: { deletedAt: null },
    });
  }

  async create(dto: any) {
    return this.prisma.document.create({
      data: {
        name: dto.name,
        type: dto.type,
        url: dto.url,
        employeeId: dto.employeeId,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
