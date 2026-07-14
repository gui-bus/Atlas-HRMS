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
import { DepartmentsService } from "./departments.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { DepartmentResponseDto, DepartmentDetailsResponseDto } from "./dto/department-response.dto";
import {
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  NotFoundErrorResponseDto,
  ConflictErrorResponseDto,
  BadRequestErrorResponseDto,
} from "../common/dto/error-responses.dto";

@ApiTags("Departments")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("departments")
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
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: "Listar todos os departamentos cadastrados ativos" })
  @ApiResponse({
    status: 200,
    description: "Lista de departamentos recuperada com sucesso",
    type: [DepartmentResponseDto],
  })
  async findAll() {
    return this.departmentsService.findAll();
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: "Recuperar detalhes de um departamento específico" })
  @ApiResponse({
    status: 200,
    description: "Departamento encontrado e retornado com sucesso",
    type: DepartmentDetailsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Departamento não encontrado",
    type: NotFoundErrorResponseDto,
  })
  async findOne(@Param("id") id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: "Criar um novo departamento (Apenas Administrador e RH)" })
  @ApiResponse({
    status: 201,
    description: "Departamento criado com sucesso",
    type: DepartmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos fornecidos no payload",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Conflito: nome ou código de departamento já existente",
    type: ConflictErrorResponseDto,
  })
  async create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: "Atualizar os dados de um departamento existente (Apenas Administrador e RH)",
  })
  @ApiResponse({
    status: 200,
    description: "Departamento atualizado com sucesso",
    type: DepartmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos fornecidos no payload",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Departamento não encontrado",
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Conflito: nome ou código já em uso por outro departamento",
    type: ConflictErrorResponseDto,
  })
  async update(@Param("id") id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({
    summary: "Remover logicamente (excluir) um departamento (Apenas Administrador e RH)",
  })
  @ApiResponse({
    status: 200,
    description: "Departamento excluído com sucesso",
  })
  @ApiResponse({
    status: 400,
    description: "Regra de negócio: departamento possui funcionários ativos vinculados",
    type: BadRequestErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Departamento não encontrado",
    type: NotFoundErrorResponseDto,
  })
  async remove(@Param("id") id: string) {
    return this.departmentsService.remove(id);
  }
}
