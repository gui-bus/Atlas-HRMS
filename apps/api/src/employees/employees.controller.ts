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
import { EmployeesService } from "./employees.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { EmployeeResponseDto } from "./dto/employee-response.dto";
import {
  ValidationErrorResponseDto,
  UnauthorizedErrorResponseDto,
  ForbiddenErrorResponseDto,
  NotFoundErrorResponseDto,
  ConflictErrorResponseDto,
} from "../common/dto/error-responses.dto";

@ApiTags("Employees")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("employees")
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
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: "Listar todos os funcionários ativos (Apenas Admin, RH e Gestores)" })
  @ApiResponse({
    status: 200,
    description: "Lista de funcionários recuperada com sucesso",
    type: [EmployeeResponseDto],
  })
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.HR, UserRole.MANAGER)
  @ApiOperation({ summary: "Recuperar detalhes completos de um funcionário" })
  @ApiResponse({
    status: 200,
    description: "Funcionário encontrado e retornado com sucesso",
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Funcionário não encontrado",
    type: NotFoundErrorResponseDto,
  })
  async findOne(@Param("id") id: string) {
    return this.employeesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: "Cadastrar um novo funcionário (Apenas Admin e RH)" })
  @ApiResponse({
    status: 201,
    description: "Funcionário criado com sucesso",
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos fornecidos no payload",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Conflito: e-mail ou CPF já cadastrados",
    type: ConflictErrorResponseDto,
  })
  async create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: "Atualizar os dados de um funcionário existente (Apenas Admin e RH)" })
  @ApiResponse({
    status: 200,
    description: "Funcionário atualizado com sucesso",
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos fornecidos no payload",
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Funcionário não encontrado",
    type: NotFoundErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: "Conflito: e-mail ou CPF já associados a outro funcionário",
    type: ConflictErrorResponseDto,
  })
  async update(@Param("id") id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: "Remover logicamente um funcionário (soft delete) (Apenas Admin e RH)" })
  @ApiResponse({
    status: 200,
    description: "Funcionário excluído (marcado como inativo e deletedAt preenchido) com sucesso",
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: "Funcionário não encontrado",
    type: NotFoundErrorResponseDto,
  })
  async remove(@Param("id") id: string) {
    return this.employeesService.remove(id);
  }
}
