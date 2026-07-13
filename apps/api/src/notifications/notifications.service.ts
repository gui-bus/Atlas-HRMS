import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, message: string) {
    console.log(
      "NotificationsService.create check:",
      typeof this.prisma,
      typeof userId,
      typeof message,
    );
    return { success: true };
  }

  async findAll(userId: string) {
    console.log("NotificationsService.findAll check:", typeof this.prisma, typeof userId);
    return [];
  }

  async markAsRead(id: string) {
    console.log("NotificationsService.markAsRead check:", typeof this.prisma, typeof id);
    return { success: true };
  }
}
