import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(userId: string | null, action: string, details: string) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  }

  async findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
    });
  }
}
