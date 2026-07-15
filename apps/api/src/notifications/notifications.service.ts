import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, message: string) {
    const userExists = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!userExists) {
      throw new NotFoundException("Usuário destinatário não encontrado");
    }

    return this.prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async markAsRead(id: string, requesterUserId: string, isAdmin: boolean) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException("Notificação não encontrada");
    }

    if (!isAdmin && notification.userId !== requesterUserId) {
      throw new ForbiddenException("Você não tem permissão para ler esta notificação");
    }

    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}
