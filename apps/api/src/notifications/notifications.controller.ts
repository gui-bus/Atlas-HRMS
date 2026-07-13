import { Controller, Get, Post, Put, Body, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";

@ApiTags("notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("user/:userId")
  async findAll(@Param("userId") userId: string) {
    return this.notificationsService.findAll(userId);
  }

  @Post()
  async create(@Body() dto: { userId: string; message: string }) {
    return this.notificationsService.create(dto.userId, dto.message);
  }

  @Put(":id/read")
  async markAsRead(@Param("id") id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
