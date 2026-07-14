import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { UserResponseDto } from "./dto/user-response.dto";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "@prisma/client";
import {
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  NotFoundErrorResponseDto,
} from "../common/dto/error-responses.dto";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("users")
@ApiResponse({
  status: 401,
  description: "Não autenticado",
  type: UnauthorizedErrorResponseDto,
})
@ApiResponse({
  status: 403,
  description: "Acesso negado",
  type: ForbiddenErrorResponseDto,
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: "Listar todas as contas de usuário do sistema (Apenas Admin e RH)" })
  @ApiResponse({
    status: 200,
    description: "Lista de contas retornada com sucesso",
    type: [UserResponseDto],
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: "Buscar detalhes de uma conta de usuário específica (Apenas Admin e RH)" })
  @ApiResponse({
    status: 200,
    description: "Usuário encontrado e retornado com sucesso",
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Usuário não encontrado",
    type: NotFoundErrorResponseDto,
  })
  async findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }
}
