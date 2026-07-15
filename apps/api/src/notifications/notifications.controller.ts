import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { CurrentUser } from "../auth/current-user.decorator";
import { NotificationsService } from "./notifications.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { NotificationResponseDto } from "./dto/notification-response.dto";
import {
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  NotFoundErrorResponseDto,
} from "../common/dto/error-responses.dto";

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("notifications")
@ApiResponse({
  status: 401,
  description: "Não autenticado — token JWT ausente ou inválido",
  type: UnauthorizedErrorResponseDto,
})
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: "Listar todas as notificações do usuário logado",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de notificações do usuário carregada com sucesso",
    type: [NotificationResponseDto],
  })
  async findAll(@CurrentUser() user: { sub: string; role: UserRole }) {
    return this.notificationsService.findAll(user.sub);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: "Criar uma nova notificação para um usuário específico (Apenas Admin e RH)",
  })
  @ApiResponse({
    status: 201,
    description: "Notificação criada com sucesso",
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos fornecidos no payload",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Acesso proibido (permissão insuficiente)",
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Usuário destinatário informado não encontrado",
    type: NotFoundErrorResponseDto,
  })
  async create(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto.userId, dto.message);
  }

  @Put(":id/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Marcar uma notificação específica do usuário logado como lida",
  })
  @ApiResponse({
    status: 200,
    description: "Notificação marcada como lida com sucesso",
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "Acesso proibido (tentou ler notificação de outro usuário)",
    type: ForbiddenErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Notificação informada não encontrada",
    type: NotFoundErrorResponseDto,
  })
  async markAsRead(
    @Param("id") id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.notificationsService.markAsRead(id, user.sub, isAdmin);
  }
}
