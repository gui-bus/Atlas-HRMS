import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { QueryAuditLogDto } from "./dto/query-audit-log.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(userId: string | null, action: string, details: string, _ip?: string) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  }

  async findAll(query: QueryAuditLogDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      where.OR = [
        { action: { contains: searchLower, mode: "insensitive" } },
        { details: { contains: searchLower, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
