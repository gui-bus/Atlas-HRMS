import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(userId: string | null, action: string, details: string) {
    console.log(
      "AuditService.logAction check:",
      typeof this.prisma,
      typeof userId,
      typeof action,
      typeof details,
    );
    return { success: true };
  }

  async findAll() {
    console.log("AuditService.findAll check:", typeof this.prisma);
    return [];
  }
}
