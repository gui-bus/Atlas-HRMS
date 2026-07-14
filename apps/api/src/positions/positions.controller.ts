import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { PositionsService } from "./positions.service";
import { CreatePositionDto } from "./dto/create-position.dto";
import { UpdatePositionDto } from "./dto/update-position.dto";
import { PositionResponseDto, PositionDetailsResponseDto } from "./dto/position-response.dto";
import {
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  NotFoundErrorResponseDto,
  ConflictErrorResponseDto,
  BadRequestErrorResponseDto,
} from "../common/dto/error-responses.dto";

@ApiTags("Positions")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("positions")
@ApiResponse({
  status: 401,
  description: "Não autenticado (token ausente ou inválido)",
  type: UnauthorizedErrorResponseDto,
})
@ApiResponse({
  status: 403,
  description: "Acesso proibido (permissão insuficiente)",
  type: ForbiddenErrorResponseDto,
})
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: "Listar todos os cargos cadastrados ativos" })
  @ApiResponse({
    status: 200,
    description: "Lista de cargos recuperada com sucesso",
    type: [PositionResponseDto],
  })
  async findAll() {
    return this.positionsService.findAll();
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: "Recuperar detalhes de um cargo específico" })
  @ApiResponse({
    status: 200,
    description: "Cargo encontrado e retornado com sucesso",
    type: PositionDetailsResponseDto,
  })
  @ApiResponse({ status: 404, description: "Cargo não encontrado", type: NotFoundErrorResponseDto })
  async findOne(@Param("id") id: string) {
    return this.positionsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: "Criar um novo cargo (Apenas Administrador e RH)" })
  @ApiResponse({
    status: 201,
    description: "Cargo criado com sucesso",
    type: PositionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos fornecidos no payload",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Departamento associado não encontrado",
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Conflito: título de cargo já existente no departamento",
    type: ConflictErrorResponseDto,
  })
  async create(@Body() dto: CreatePositionDto) {
    return this.positionsService.create(dto);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: "Atualizar os dados de um cargo existente (Apenas Administrador e RH)" })
  @ApiResponse({
    status: 200,
    description: "Cargo atualizado com sucesso",
    type: PositionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos fornecidos no payload",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Cargo ou departamento indicado não encontrado",
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Conflito: título já em uso no departamento",
    type: ConflictErrorResponseDto,
  })
  async update(@Param("id") id: string, @Body() dto: UpdatePositionDto) {
    return this.positionsService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: "Remover logicamente (excluir) um cargo (Apenas Administrador e RH)" })
  @ApiResponse({
    status: 200,
    description: "Cargo excluído com sucesso",
  })
  @ApiResponse({
    status: 400,
    description: "Regra de negócio: cargo possui funcionários ativos vinculados",
    type: BadRequestErrorResponseDto,
  })
  @ApiResponse({ status: 404, description: "Cargo não encontrado", type: NotFoundErrorResponseDto })
  async remove(@Param("id") id: string) {
    return this.positionsService.remove(id);
  }
}
